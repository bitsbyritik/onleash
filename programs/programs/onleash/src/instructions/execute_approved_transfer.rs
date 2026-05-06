use crate::{
    errors::OnLeashError,
    events::ApprovedTransferExecuted,
    instructions::policy_checks::enforce_policy_and_update_spend,
    state::{ApprovalAccount, ApprovalStatus, PolicyAccount},
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct ExecuteApprovedTransfer<'info> {
    #[account(
        mut,
        seeds = [
                b"approval",
                approval.policy.as_ref(),
                &approval.seed_timestamp.to_le_bytes(),
            ],
            bump = approval.bump,
            constraint = approval.agent_wallet == agent.key() @ OnLeashError::Unauthorized,
            constraint = approval.status == ApprovalStatus::Approved @ OnLeashError::ApprovalNotGranted,
            constraint = approval.policy == policy.key() @ OnLeashError::ApprovalPolicyMismatch,
            close = agent,
        )]
    pub approval: Account<'info, ApprovalAccount>,

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

pub fn execute_approved_transfer(ctx: Context<ExecuteApprovedTransfer>) -> Result<()> {
    let clock = Clock::get()?;
    let amount = ctx.accounts.approval.amount;
    let recipient = ctx.accounts.approval.recipient;

    // Expiry check
    require!(
        clock.unix_timestamp < ctx.accounts.approval.expires_at,
        OnLeashError::ApprovalExpired
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

    // Mark approval as used
    ctx.accounts.approval.status = ApprovalStatus::Used;

    emit!(ApprovedTransferExecuted {
        approval: ctx.accounts.approval.key(),
        policy: ctx.accounts.policy.key(),
        recipient,
        amount,
        spent_today: ctx.accounts.policy.spent_today,
    });

    Ok(())
}
