use anchor_lang::prelude::*;

use crate::{
    errors::OnLeashError,
    events::ChildPolicyInitialized,
    state::{PolicyAccount},
};

#[derive(Accounts)]
#[instruction(params: InitializeChildPolicyParams)]
pub struct InitializeChildPolicy<'info> {
    #[account(
        init,
        payer = owner,
        space = PolicyAccount::space(),
        seeds = [b"policy", params.agent_wallet.as_ref()],
        bump
    )]
    pub child_policy: Account<'info, PolicyAccount>,

    #[account(
        mut,
        seeds = [b"policy", parent_policy.agent_wallet.as_ref()],
        bump = parent_policy.bump,
        constraint = parent_policy.owner == owner.key() @ OnLeashError::Unauthorized,
        constraint = parent_policy.is_active @ OnLeashError::PolicyInactive,
    )]
    pub parent_policy: Account<'info, PolicyAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitializeChildPolicyParams {
    pub agent_wallet: Pubkey,
    pub daily_cap: u64,
    pub per_vendor_cap: u64,
    pub approval_threshold: u64,
}

pub fn initialize_child_policy(
    ctx: Context<InitializeChildPolicy>,
    params: InitializeChildPolicyParams,
) -> Result<()> {
    let parent = &ctx.accounts.parent_policy;
    let child = &mut ctx.accounts.child_policy;
    let clock = Clock::get()?;

    require!(
        params.daily_cap <= parent.daily_cap,
        OnLeashError::ChildCapExceedsParent
    );
    require!(params.daily_cap > 0, OnLeashError::InvalidCap);
    require!(params.per_vendor_cap > 0, OnLeashError::InvalidCap);
    require!(
        params.per_vendor_cap <= params.daily_cap,
        OnLeashError::VendorCapExceedsDailyCap
    );

    child.owner = ctx.accounts.owner.key();
    child.agent_wallet = params.agent_wallet;
    child.daily_cap = params.daily_cap;
    child.per_vendor_cap = params.per_vendor_cap;
    child.approval_threshold = params.approval_threshold;
    child.blocklist = vec![];
    child.allowlist = vec![];
    child.allowlist_mode = false;
    child.spent_today = 0;
    child.vendor_entries = vec![];
    child.last_reset = clock.unix_timestamp;
    child.parent_policy = Some(ctx.accounts.parent_policy.key());
    child.version = 1;
    child.is_active = true;
    child.bump = ctx.bumps.child_policy;

    emit!(ChildPolicyInitialized {
        child_policy: ctx.accounts.child_policy.key(),
        parent_policy: ctx.accounts.parent_policy.key(),
        agent_wallet: params.agent_wallet,
        daily_cap: params.daily_cap,
    });

    Ok(())
}
