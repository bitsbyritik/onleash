use anchor_lang::prelude::*;

#[error_code]
pub enum OnLeashError {
    #[msg("Daily cap exceeded — transfer blocked by OnLeash")]
    DailyCapExceeded,

    #[msg("Per-vendor cap exceeded — too much sent to this address today")]
    VendorCapExceeded,

    #[msg("Address is on the blocklist")]
    BlocklistedAddress,

    #[msg("Address is not on the allowlist")]
    AddressNotAllowlisted,

    #[msg("Parent agent daily cap exceeded")]
    ParentDailyCapExceeded,

    #[msg("Child daily cap cannot exceed parent daily cap")]
    ChildCapExceedsParent,

    #[msg("Per-vendor cap cannot exceed daily cap")]
    VendorCapExceedsDailyCap,

    #[msg("Cap must be greater than zero")]
    InvalidCap,

    #[msg("Transfer amount must be greater than zero")]
    ZeroAmount,

    #[msg("Arithmetic overflow")]
    Overflow,

    #[msg("Policy is inactive — transfers permanently disabled")]
    PolicyInactive,

    #[msg("Unauthorized — only owner can perform this action")]
    Unauthorized,

    #[msg("Blocklist is full — maximum 10 addresses")]
    BlocklistTooLarge,

    #[msg("Allowlist is full — maximum 20 addresses")]
    AllowlistTooLarge,

    #[msg("Too many vendor entries — maximum 20 vendors tracked per day")]
    TooManyVendors,

    #[msg("Transfer amount exceeds approval threshold – Telegram approval required")]
    ApprovalRequired,

    #[msg("Child per-vendor cap cannot exceed parent per-vendor cap")]
    ChildPerVendorCapExceedsParent,

}
