use anchor_lang::prelude::*;

use crate::{constants::*, errors::OnLeashError, events::PolicyUpdated, state::PolicyAccount};

#[derive(Accounts)]
pub struct UpdatePolicy<'info> {
    #[account(
        mut,
        seeds = [b"policy", policy.agent_wallet.as_ref()],
        bump = policy.bump,
        constraint = policy.owner == owner.key() @ OnLeashError::Unauthorized,
    )]
    pub policy: Account<'info, PolicyAccount>,

    pub owner: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdatePolicyParams {
    pub daily_cap: u64,
    pub per_vendor_cap: u64,
    pub approval_threshold: u64,
    pub blocklist: Vec<Pubkey>,
    pub allowlist: Vec<Pubkey>,
    pub allowlist_mode: bool,
}

pub fn update_policy(ctx: Context<UpdatePolicy>, params: UpdatePolicyParams) -> Result<()> {
    let policy = &mut ctx.accounts.policy;

    require!(policy.is_active, OnLeashError::PolicyInactive);
    require!(params.daily_cap > 0, OnLeashError::InvalidCap);
    require!(params.per_vendor_cap > 0, OnLeashError::InvalidCap);
    require!(params.approval_threshold > 0, OnLeashError::InvalidCap);
    require!(
        params.per_vendor_cap <= params.daily_cap,
        OnLeashError::VendorCapExceedsDailyCap
    );
    require!(
        params.blocklist.len() <= MAX_BLOCKLIST,
        OnLeashError::BlocklistTooLarge
    );
    require!(
        params.allowlist.len() <= MAX_ALLOWLIST,
        OnLeashError::AllowlistTooLarge
    );

    policy.daily_cap = params.daily_cap;
    policy.per_vendor_cap = params.per_vendor_cap;
    policy.approval_threshold = params.approval_threshold;
    policy.blocklist = params.blocklist;
    policy.allowlist = params.allowlist;
    policy.allowlist_mode = params.allowlist_mode;
    policy.version += 1;

    emit!(PolicyUpdated {
        policy: policy.key(),
        version: policy.version,
    });

    Ok(())
}
