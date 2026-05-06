use crate::{errors::OnLeashError, events::PolicyClosed, state::PolicyAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ClosePolicy<'info> {
    #[account(
        mut,
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.owner == owner.key() @ OnLeashError::Unauthorized,
        constraint = !policy.is_active @ OnLeashError::PolicyStillActive,
        close = owner,
    )]
    pub policy: Account<'info, PolicyAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn close_policy(ctx: Context<ClosePolicy>) -> Result<()> {
    emit!(PolicyClosed {
        policy: ctx.accounts.policy.key(),
        agent_wallet: ctx.accounts.policy.agent_wallet,
    });

    Ok(())
}
