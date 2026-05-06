use anchor_lang::prelude::*;

use crate::{errors::OnLeashError, events::DailySpendReset, state::PolicyAccount};

#[derive(Accounts)]
pub struct ResetDailySpend<'info> {
    #[account(
        mut,
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.owner == owner.key() @ OnLeashError::Unauthorized,
    )]
    pub policy: Account<'info, PolicyAccount>,

    pub owner: Signer<'info>,
}

pub fn reset_daily_spend(ctx: Context<ResetDailySpend>) -> Result<()> {
    let policy = &mut ctx.accounts.policy;
    let clock = Clock::get()?;
    require!(policy.is_active, OnLeashError::PolicyInactive);

    policy.spent_today = 0;
    policy.vendor_entries = vec![];
    policy.last_reset = clock.unix_timestamp;

    emit!(DailySpendReset {
        policy: ctx.accounts.policy.key(),
        reset_at: clock.unix_timestamp,
    });

    Ok(())
}
