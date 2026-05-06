use crate::{
    errors::OnLeashError,
    events::ApprovalRejected,
    state::{ApprovalAccount, ApprovalStatus, PolicyAccount},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct RejectApproval<'info> {
    #[account(
        mut,
        seeds = [
            b"approval",
            approval.policy.as_ref(),
            &approval.seed_timestamp.to_le_bytes(),
        ],
        bump = approval.bump,
        constraint = approval.policy == policy.key() @ OnLeashError::ApprovalPolicyMismatch,
        close = agent,
    )]
    pub approval: Account<'info, ApprovalAccount>,

    #[account(
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.owner == owner.key() @ OnLeashError::Unauthorized,
    )]
    pub policy: Account<'info, PolicyAccount>,

    #[account(mut, address = approval.agent_wallet @ OnLeashError::Unauthorized)]
    pub agent: SystemAccount<'info>,

    pub owner: Signer<'info>,
}

pub fn reject_approval(ctx: Context<RejectApproval>) -> Result<()> {
    require!(
        ctx.accounts.approval.status == ApprovalStatus::Pending,
        OnLeashError::ApprovalNotPending,
    );

    ctx.accounts.approval.status = ApprovalStatus::Rejected;

    emit!(ApprovalRejected {
        approval: ctx.accounts.approval.key(),
        policy: ctx.accounts.approval.policy,
    });

    Ok(())
}
