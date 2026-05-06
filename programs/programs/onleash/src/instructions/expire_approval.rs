use crate::{
    errors::OnLeashError,
    events::ApprovalExpired,
    state::{ApprovalAccount, ApprovalStatus},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ExpireApproval<'info> {
    #[account(
        mut,
        seeds = [
            b"approval",
            approval.policy.as_ref(),
            &approval.seed_timestamp.to_le_bytes(),
        ],
        bump = approval.bump,
        close = agent,
    )]
    pub approval: Account<'info, ApprovalAccount>,

    #[account(mut, address = approval.agent_wallet @ OnLeashError::Unauthorized)]
    pub agent: SystemAccount<'info>,
}

pub fn expire_approval(ctx: Context<ExpireApproval>) -> Result<()> {
    let approval = &mut ctx.accounts.approval;
    let clock = Clock::get()?;

    require!(
        clock.unix_timestamp >= approval.expires_at,
        OnLeashError::ApprovalNotExpired,
    );
    require!(
        approval.status == ApprovalStatus::Pending || approval.status == ApprovalStatus::Approved,
        OnLeashError::ApprovalNotPending,
    );

    approval.status = ApprovalStatus::Expired;

    emit!(ApprovalExpired {
        approval: approval.key(),
        policy: approval.policy,
    });

    Ok(())
}
