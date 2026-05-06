use anchor_lang::prelude::*;

#[event]
pub struct PolicyInitialized {
    pub policy: Pubkey,
    pub agent_wallet: Pubkey,
    pub owner: Pubkey,
}

#[event]
pub struct ChildPolicyInitialized {
    pub child_policy: Pubkey,
    pub parent_policy: Pubkey,
    pub agent_wallet: Pubkey,
    pub daily_cap: u64,
}

#[event]
pub struct PolicyUpdated {
    pub policy: Pubkey,
    pub version: u32,
}

#[event]
pub struct TransferExecuted {
    pub policy: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub spent_today: u64,
    pub daily_cap: u64,
}

#[event]
pub struct PolicyDeactivated {
    pub policy: Pubkey,
}

#[event]
pub struct DailySpendReset {
    pub policy: Pubkey,
    pub reset_at: i64,
}

#[event]
pub struct ApprovalRequested {
    pub approval: Pubkey,
    pub policy: Pubkey,
    pub amount: u64,
    pub recipient: Pubkey,
    pub expires_at: i64,
}

#[event]
pub struct ApprovalGranted {
    pub approval: Pubkey,
    pub policy: Pubkey,
}

#[event]
pub struct ApprovedTransferExecuted {
    pub approval: Pubkey,
    pub policy: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub spent_today: u64,
}
