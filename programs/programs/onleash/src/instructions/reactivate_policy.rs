use crate::{errors::OnLeashError, events::PolicyReactivated, state::PolicyAccount};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ReactivatePolicy<'info> {
    #[account(
        mut,
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.owner == owner.key() @ OnLeashError::Unauthorized,
    )]
    pub policy: Account<'info, PolicyAccount>,

    pub owner: Signer<'info>,
}

pub fn reactivate_policy(ctx: Context<ReactivatePolicy>) -> Result<()> {
    let policy = &mut ctx.accounts.policy;
    require!(!policy.is_active, OnLeashError::PolicyAlreadyActive);
    policy.is_active = true;

    emit!(PolicyReactivated {
        policy: ctx.accounts.policy.key(),
    });

    Ok(())
}
