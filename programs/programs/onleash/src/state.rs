use anchor_lang::prelude::*;

use crate::constants::*;

#[account]
pub struct PolicyAccount {
    pub owner: Pubkey,
    pub agent_wallet: Pubkey,
    pub daily_cap: u64,
    pub per_vendor_cap: u64,
    pub approval_threshold: u64,
    pub blocklist: Vec<Pubkey>,
    pub allowlist: Vec<Pubkey>,
    pub allowlist_mode: bool,
    pub spent_today: u64,
    pub vendor_entries: Vec<VendorEntry>,
    pub last_reset: i64,
    pub parent_policy: Option<Pubkey>,
    pub version: u32,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
pub struct ApprovalAccount {
    pub policy: Pubkey,
    pub agent_wallet: Pubkey,
    pub amount: u64,
    pub recipient: Pubkey,
    pub status: ApprovalStatus,
    pub created_at: i64,
    pub expires_at: i64,
    pub seed_timestamp: i64,
    pub bump: u8,
}

impl PolicyAccount {
    pub fn space() -> usize {
        8                                    // discriminator
        + 32                                 // owner
        + 32                                 // agent_wallet
        + 8                                  // daily_cap
        + 8                                  // per_vendor_cap
        + 8                                  // approval_threshold
        + 4 + (32 * MAX_BLOCKLIST)           // blocklist
        + 4 + (32 * MAX_ALLOWLIST)           // allowlist
        + 1                                  // allowlist_mode
        + 8                                  // spent_today
        + 4 + (40 * MAX_VENDOR_ENTRIES)      // vendor_entries
        + 8                                  // last_reset
        + 1 + 32                             // parent_policy Option
        + 4                                  // version
        + 1                                  // is_active
        + 1 // bump
    }
}

impl ApprovalAccount {
    pub fn space() -> usize {
        8                                   // discriminator
        + 32                                // policy
        + 32                                // agent_wallet
        + 8                                 // amount
        + 32                                // recipient
        + 1                                 // status (enum)
        + 8                                 // created_at
        + 8                                 // expires_at
        + 8                                 // seed_timestamp
        + 1 // bump
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct VendorEntry {
    pub address: Pubkey,
    pub amount: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub enum ApprovalStatus {
    Pending,
    Approved,
    Rejected,
    Expired,
    Used,
}
