use anchor_lang::prelude::*;
use crate::{
    constants::*,
    errors::OnLeashError,
    events::PolicyInitialized,
    state::{PolicyAccount},
};

#[derive(Accounts)]
#[instruction(params: InitializePolicyParams)]
pub struct InitializePolicy<'info> {
    #[account(
        init,
        payer = owner,
        space = PolicyAccount::space(),
        seeds = [b"policy", params.agent_wallet.as_ref()],
        bump
    )]
    pub policy: Account<'info, PolicyAccount>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializePolicyParams {
    pub agent_wallet: Pubkey,
    pub daily_cap: u64,
    pub per_vendor_cap: u64,
    pub approval_threshold: u64,
    pub blocklist: Vec<Pubkey>,
    pub allowlist: Vec<Pubkey>,
    pub allowlist_mode: bool,
    pub parent_policy: Option<Pubkey>,
}

pub fn initialize_policy(
    ctx: Context<InitializePolicy>,
    params: InitializePolicyParams,
) -> Result<()> {
    let policy = &mut ctx.accounts.policy;
    let clock = Clock::get()?;

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

    policy.owner = ctx.accounts.owner.key();
    policy.agent_wallet = params.agent_wallet;
    policy.daily_cap = params.daily_cap;
    policy.per_vendor_cap = params.per_vendor_cap;
    policy.approval_threshold = params.approval_threshold;
    policy.blocklist = params.blocklist;
    policy.allowlist = params.allowlist;
    policy.allowlist_mode = params.allowlist_mode;
    policy.spent_today = 0;
    policy.vendor_entries = vec![];
    policy.last_reset = clock.unix_timestamp;
    policy.parent_policy = params.parent_policy;
    policy.version = 1;
    policy.is_active = true;
    policy.bump = ctx.bumps.policy;

    emit!(PolicyInitialized {
        policy: ctx.accounts.policy.key(),
        agent_wallet: params.agent_wallet,
        owner: ctx.accounts.owner.key(),
    });

    Ok(())
}
