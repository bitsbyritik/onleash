use anchor_lang::prelude::*;

use crate::{errors::OnLeashError, events::PolicyDeactivated, state::PolicyAccount};

#[derive(Accounts)]
pub struct DeactivatePolicy<'info> {
    #[account(
        mut,
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.owner == owner.key() @ OnLeashError::Unauthorized,
    )]
    pub policy: Account<'info, PolicyAccount>,

    pub owner: Signer<'info>,
}

pub fn deactivate_policy(ctx: Context<DeactivatePolicy>) -> Result<()> {
    let policy = &mut ctx.accounts.policy;
    policy.is_active = false;

    emit!(PolicyDeactivated {
        policy: ctx.accounts.policy.key(),
    });

    Ok(())
}
