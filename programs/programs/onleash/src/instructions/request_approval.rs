use crate::{
    errors::OnLeashError,
    events::ApprovalRequested,
    state::{ApprovalAccount, ApprovalStatus, PolicyAccount},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(timestamp: i64)]
pub struct RequestApproval<'info> {
    #[account(
        init,
        payer = agent,
        space = ApprovalAccount::space(),
        seeds = [
            b"approval",
            policy.key().as_ref(),
            &timestamp.to_le_bytes(),
        ],
        bump
    )]
    pub approval: Account<'info, ApprovalAccount>,

    #[account(
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.agent_wallet == agent.key() @ OnLeashError::Unauthorized,
        constraint = policy.is_active @ OnLeashError::PolicyInactive,
    )]
    pub policy: Account<'info, PolicyAccount>,

    #[account(mut)]
    pub agent: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn request_approval(
    ctx: Context<RequestApproval>,
    amount: u64,
    recipient: Pubkey,
    expires_at: i64,
    _timestamp: i64,
) -> Result<()> {
    let approval = &mut ctx.accounts.approval;
    let clock = Clock::get()?;
    let policy = &ctx.accounts.policy;

    // Must be above threshold (otherwise SDK should call execute_transfer directly)
    require!(
        amount >= policy.approval_threshold,
        OnLeashError::BelowApprovalThreshold
    );
    require!(
        expires_at > clock.unix_timestamp,
        OnLeashError::InvalidExpiry
    );

    approval.policy = policy.key();
    approval.agent_wallet = policy.agent_wallet;
    approval.amount = amount;
    approval.recipient = recipient;
    approval.status = ApprovalStatus::Pending;
    approval.created_at = clock.unix_timestamp;
    approval.expires_at = expires_at;
    approval.seed_timestamp = _timestamp;
    approval.bump = ctx.bumps.approval;

    emit!(ApprovalRequested {
        approval: approval.key(),
        policy: policy.key(),
        amount,
        recipient,
        expires_at,
    });

    Ok(())
}
