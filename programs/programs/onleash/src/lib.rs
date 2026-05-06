use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

use instructions::approve_transfer::ApproveTransfer;
use instructions::close_policy::ClosePolicy;
use instructions::deactivate_policy::DeactivatePolicy;
use instructions::execute_approved_transfer::ExecuteApprovedTransfer;
use instructions::execute_transfer::ExecuteTransfer;
use instructions::expire_approval::ExpireApproval;
use instructions::initialize_child_policy::{InitializeChildPolicy, InitializeChildPolicyParams};
use instructions::initialize_policy::{InitializePolicy, InitializePolicyParams};
use instructions::reactivate_policy::ReactivatePolicy;
use instructions::reject_approval::RejectApproval;
use instructions::request_approval::RequestApproval;
use instructions::reset_daily_spend::ResetDailySpend;
use instructions::update_policy::{UpdatePolicy, UpdatePolicyParams};

pub(crate) use instructions::approve_transfer::__client_accounts_approve_transfer;
pub(crate) use instructions::close_policy::__client_accounts_close_policy;
pub(crate) use instructions::deactivate_policy::__client_accounts_deactivate_policy;
pub(crate) use instructions::execute_approved_transfer::__client_accounts_execute_approved_transfer;
pub(crate) use instructions::execute_transfer::__client_accounts_execute_transfer;
pub(crate) use instructions::expire_approval::__client_accounts_expire_approval;
pub(crate) use instructions::initialize_child_policy::__client_accounts_initialize_child_policy;
pub(crate) use instructions::initialize_policy::__client_accounts_initialize_policy;
pub(crate) use instructions::reactivate_policy::__client_accounts_reactivate_policy;
pub(crate) use instructions::reject_approval::__client_accounts_reject_approval;
pub(crate) use instructions::request_approval::__client_accounts_request_approval;
pub(crate) use instructions::reset_daily_spend::__client_accounts_reset_daily_spend;
pub(crate) use instructions::update_policy::__client_accounts_update_policy;

declare_id!("71XPKUg1c8rHuKHZ9pmvfrPkREwXHPQKtndQyDJWWSDS");

#[program]
pub mod onleash {
    use super::*;

    pub fn initialize_policy(
        ctx: Context<InitializePolicy>,
        params: InitializePolicyParams,
    ) -> Result<()> {
        instructions::initialize_policy::initialize_policy(ctx, params)
    }

    pub fn initialize_child_policy(
        ctx: Context<InitializeChildPolicy>,
        params: InitializeChildPolicyParams,
    ) -> Result<()> {
        instructions::initialize_child_policy::initialize_child_policy(ctx, params)
    }

    pub fn update_policy(ctx: Context<UpdatePolicy>, params: UpdatePolicyParams) -> Result<()> {
        instructions::update_policy::update_policy(ctx, params)
    }

    pub fn execute_transfer(
        ctx: Context<ExecuteTransfer>,
        amount: u64,
        recipient: Pubkey,
    ) -> Result<()> {
        instructions::execute_transfer::execute_transfer(ctx, amount, recipient)
    }

    pub fn execute_approved_transfer(ctx: Context<ExecuteApprovedTransfer>) -> Result<()> {
        instructions::execute_approved_transfer::execute_approved_transfer(ctx)
    }

    pub fn request_approval(
        ctx: Context<RequestApproval>,
        amount: u64,
        recipient: Pubkey,
        expires_at: i64,
        timestamp: i64,
    ) -> Result<()> {
        instructions::request_approval::request_approval(
            ctx, amount, recipient, expires_at, timestamp,
        )
    }

    pub fn approve_transfer(ctx: Context<ApproveTransfer>) -> Result<()> {
        instructions::approve_transfer::approve_transfer(ctx)
    }

    pub fn reject_approval(ctx: Context<RejectApproval>) -> Result<()> {
        instructions::reject_approval::reject_approval(ctx)
    }

    pub fn expire_approval(ctx: Context<ExpireApproval>) -> Result<()> {
        instructions::expire_approval::expire_approval(ctx)
    }

    pub fn reactivate_policy(ctx: Context<ReactivatePolicy>) -> Result<()> {
        instructions::reactivate_policy::reactivate_policy(ctx)
    }

    pub fn deactivate_policy(ctx: Context<DeactivatePolicy>) -> Result<()> {
        instructions::deactivate_policy::deactivate_policy(ctx)
    }

    pub fn close_policy(ctx: Context<ClosePolicy>) -> Result<()> {
        instructions::close_policy::close_policy(ctx)
    }

    pub fn reset_daily_spend(ctx: Context<ResetDailySpend>) -> Result<()> {
        instructions::reset_daily_spend::reset_daily_spend(ctx)
    }
}
