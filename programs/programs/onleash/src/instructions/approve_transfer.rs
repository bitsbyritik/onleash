use crate::{
    errors::OnLeashError,
    events::ApprovalGranted,
    state::{ApprovalAccount, ApprovalStatus, PolicyAccount},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ApproveTransfer<'info> {
    #[account(
        mut,
        seeds = [
            b"approval",
            approval.policy.as_ref(),
            &approval.seed_timestamp.to_le_bytes(),
        ],
        bump = approval.bump,
        constraint = approval.policy == policy.key() @ OnLeashError::ApprovalPolicyMismatch,
    )]
    pub approval: Account<'info, ApprovalAccount>,

    #[account(
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.owner == owner.key() @ OnLeashError::Unauthorized,
    )]
    pub policy: Account<'info, PolicyAccount>,

    pub owner: Signer<'info>,
}

pub fn approve_transfer(ctx: Context<ApproveTransfer>) -> Result<()> {
    let approval = &mut ctx.accounts.approval;
    let clock = Clock::get()?;

    require!(
        approval.status == ApprovalStatus::Pending,
        OnLeashError::ApprovalNotPending
    );
    require!(
        clock.unix_timestamp < approval.expires_at,
        OnLeashError::ApprovalExpired
    );

    approval.status = ApprovalStatus::Approved;

    emit!(ApprovalGranted {
        approval: approval.key(),
        policy: ctx.accounts.policy.key(),
    });

    Ok(())
}
