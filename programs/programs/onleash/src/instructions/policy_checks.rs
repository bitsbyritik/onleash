use crate::{
    constants::{MAX_VENDOR_ENTRIES, SECONDS_IN_DAY},
    errors::OnLeashError,
    state::{PolicyAccount, VendorEntry},
};
use anchor_lang::prelude::*;

pub fn enforce_policy_and_update_spend(
    policy: &mut PolicyAccount,
    parent_policy: Option<&mut PolicyAccount>,
    amount: u64,
    recipient: &Pubkey,
    clock: &Clock,
) -> Result<()> {
    let elapsed = clock.unix_timestamp - policy.last_reset;
    if elapsed >= SECONDS_IN_DAY {
        policy.spent_today = 0;
        policy.vendor_entries = vec![];
        policy.last_reset = clock.unix_timestamp;
    }

    if policy.blocklist.contains(recipient) {
        return err!(OnLeashError::BlocklistedAddress);
    }

    if policy.allowlist_mode
        && !policy.allowlist.is_empty()
        && !policy.allowlist.contains(recipient)
    {
        return err!(OnLeashError::AddressNotAllowlisted);
    }

    let projected_daily = policy
        .spent_today
        .checked_add(amount)
        .ok_or(OnLeashError::Overflow)?;
    if projected_daily > policy.daily_cap {
        return err!(OnLeashError::DailyCapExceeded);
    }

    let vendor_spent = policy
        .vendor_entries
        .iter()
        .find(|e| e.address == *recipient)
        .map(|e| e.amount)
        .unwrap_or(0);
    let projected_vendor = vendor_spent
        .checked_add(amount)
        .ok_or(OnLeashError::Overflow)?;
    if projected_vendor > policy.per_vendor_cap {
        return err!(OnLeashError::VendorCapExceeded);
    }

    policy.spent_today = projected_daily;
    if let Some(entry) = policy
        .vendor_entries
        .iter_mut()
        .find(|e| e.address == *recipient)
    {
        entry.amount = projected_vendor;
    } else {
        if policy.vendor_entries.len() >= MAX_VENDOR_ENTRIES {
            return err!(OnLeashError::TooManyVendors);
        }
        policy.vendor_entries.push(VendorEntry {
            address: *recipient,
            amount,
        });
    }

    if let Some(parent) = parent_policy {
        // Reset parent if new day
        let parent_elapsed = clock.unix_timestamp - parent.last_reset;
        if parent_elapsed >= SECONDS_IN_DAY {
            parent.spent_today = 0;
            parent.vendor_entries = vec![];
            parent.last_reset = clock.unix_timestamp;
        }

        if parent.blocklist.contains(recipient) {
            return err!(OnLeashError::ParentBlocklistedAddress);
        }

        if parent.allowlist_mode
            && !parent.allowlist.is_empty()
            && !parent.allowlist.contains(recipient)
        {
            return err!(OnLeashError::ParentAddressNotAllowlisted);
        }

        let parent_daily_proj = parent
            .spent_today
            .checked_add(amount)
            .ok_or(OnLeashError::Overflow)?;
        if parent_daily_proj > parent.daily_cap {
            return err!(OnLeashError::ParentDailyCapExceeded);
        }

        let parent_vendor_spent = parent
            .vendor_entries
            .iter()
            .find(|e| e.address == *recipient)
            .map(|e| e.amount)
            .unwrap_or(0);
        let parent_vendor_proj = parent_vendor_spent
            .checked_add(amount)
            .ok_or(OnLeashError::Overflow)?;
        if parent_vendor_proj > parent.per_vendor_cap {
            return err!(OnLeashError::ParentVendorCapExceeded);
        }

        parent.spent_today = parent_daily_proj;
        if let Some(entry) = parent
            .vendor_entries
            .iter_mut()
            .find(|e| e.address == *recipient)
        {
            entry.amount = parent_vendor_proj;
        } else {
            if parent.vendor_entries.len() >= MAX_VENDOR_ENTRIES {
                return err!(OnLeashError::TooManyVendors);
            }
            parent.vendor_entries.push(VendorEntry {
                address: *recipient,
                amount,
            });
        }
    }

    Ok(())
}
