use anchor_lang::prelude::*;

use crate::{
    constants::SECONDS_IN_DAY,
    errors::OnLeashError,
    events::TransferExecuted,
    state::{PolicyAccount, VendorEntry},
};

#[derive(Accounts)]
pub struct ExecuteTransfer<'info> {
    #[account(
        mut,
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.agent_wallet == agent.key() @ OnLeashError::Unauthorized,
        constraint = policy.is_active @ OnLeashError::PolicyInactive,
    )]
    pub policy: Account<'info, PolicyAccount>,

    /// CHECK: optional parent policy – only needed for child agents
    #[account(mut)]
    pub parent_policy: Option<Account<'info, PolicyAccount>>,

    pub agent: Signer<'info>,
}

pub fn execute_transfer(
    ctx: Context<ExecuteTransfer>,
    amount: u64,
    recipient: Pubkey,
) -> Result<()> {
    let clock = Clock::get()?;
    require!(amount > 0, OnLeashError::ZeroAmount);

    // Auto-reset daily spend for child policy
    {
        let policy = &mut ctx.accounts.policy;
        let elapsed = clock.unix_timestamp - policy.last_reset;
        if elapsed >= SECONDS_IN_DAY {
            policy.spent_today = 0;
            policy.vendor_entries = vec![];
            policy.last_reset = clock.unix_timestamp;
        }
    }

    // Blocklist check
    require!(
        !ctx.accounts.policy.blocklist.contains(&recipient),
        OnLeashError::BlocklistedAddress
    );

    // Allowlist check
    {
        let policy = &ctx.accounts.policy;
        if policy.allowlist_mode && !policy.allowlist.is_empty() {
            require!(
                policy.allowlist.contains(&recipient),
                OnLeashError::AddressNotAllowlisted
            );
        }
    }

    // Daily cap check
    let projected_daily = ctx
        .accounts
        .policy
        .spent_today
        .checked_add(amount)
        .ok_or(OnLeashError::Overflow)?;
    require!(
        projected_daily <= ctx.accounts.policy.daily_cap,
        OnLeashError::DailyCapExceeded
    );

    // Per-vendor cap check
    let vendor_spent = ctx
        .accounts
        .policy
        .vendor_entries
        .iter()
        .find(|e| e.address == recipient)
        .map(|e| e.amount)
        .unwrap_or(0);
    let projected_vendor = vendor_spent
        .checked_add(amount)
        .ok_or(OnLeashError::Overflow)?;
    require!(
        projected_vendor <= ctx.accounts.policy.per_vendor_cap,
        OnLeashError::VendorCapExceeded
    );

    // Update child spend tracking
    {
        let policy = &mut ctx.accounts.policy;
        policy.spent_today = projected_daily;

        if let Some(entry) = policy
            .vendor_entries
            .iter_mut()
            .find(|e| e.address == recipient)
        {
            entry.amount = projected_vendor;
        } else {
            require!(
                policy.vendor_entries.len() < crate::constants::MAX_VENDOR_ENTRIES,
                OnLeashError::TooManyVendors
            );
            policy.vendor_entries.push(VendorEntry {
                address: recipient,
                amount,
            });
        }
    }

    // Parent policy check and decrement
    if ctx.accounts.policy.parent_policy.is_some() {
        if let Some(parent) = ctx.accounts.parent_policy.as_mut() {
            let parent_elapsed = clock.unix_timestamp - parent.last_reset;
            if parent_elapsed >= SECONDS_IN_DAY {
                parent.spent_today = 0;
                parent.vendor_entries = vec![];
                parent.last_reset = clock.unix_timestamp;
            }

            let parent_projected = parent
                .spent_today
                .checked_add(amount)
                .ok_or(OnLeashError::Overflow)?;
            require!(
                parent_projected <= parent.daily_cap,
                OnLeashError::ParentDailyCapExceeded
            );
            parent.spent_today = parent_projected;
        }
    }

    emit!(TransferExecuted {
        policy: ctx.accounts.policy.key(),
        recipient,
        amount,
        spent_today: ctx.accounts.policy.spent_today,
        daily_cap: ctx.accounts.policy.daily_cap,
    });

    Ok(())
}
