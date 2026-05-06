use crate::{
    errors::OnLeashError, events::TransferExecuted,
    instructions::policy_checks::enforce_policy_and_update_spend, state::PolicyAccount,
};
use anchor_lang::prelude::*;

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
    require!(
        amount < ctx.accounts.policy.approval_threshold,
        OnLeashError::ApprovalRequired
    );

    match (ctx.accounts.policy.parent_policy, ctx.accounts.parent_policy.as_ref()) {
        (Some(expected), Some(parent)) => {
            require_keys_eq!(parent.key(), expected, OnLeashError::ParentPolicyMismatch);
            require!(parent.is_active, OnLeashError::PolicyInactive);
        }
        (Some(_), None) => return err!(OnLeashError::MissingParentPolicy),
        (None, Some(_)) => return err!(OnLeashError::UnexpectedParentPolicy),
        (None, None) => {}
    }

    let parent_mut = ctx.accounts.parent_policy.as_mut().map(|p| &mut **p);
    enforce_policy_and_update_spend(
        &mut ctx.accounts.policy,
        parent_mut,
        amount,
        &recipient,
        &clock,
    )?;

    emit!(TransferExecuted {
        policy: ctx.accounts.policy.key(),
        recipient,
        amount,
        spent_today: ctx.accounts.policy.spent_today,
        daily_cap: ctx.accounts.policy.daily_cap,
    });

    Ok(())
}
