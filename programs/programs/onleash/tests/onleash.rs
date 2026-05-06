use borsh::BorshSerialize;
use litesvm::LiteSVM;
use solana_instruction::{account_meta::AccountMeta, Instruction};
use solana_keypair::Keypair;
use solana_message::Message;
use solana_pubkey::Pubkey;
use solana_signer::Signer;
use solana_transaction::Transaction;

// ── Discriminators from IDL ───────────────────────────────────────────────────

const DISC_INITIALIZE_POLICY: [u8; 8] = [9, 186, 86, 225, 129, 162, 231, 56];
const DISC_INITIALIZE_CHILD_POLICY: [u8; 8] = [8, 39, 46, 255, 157, 15, 112, 220];
const DISC_UPDATE_POLICY: [u8; 8] = [212, 245, 246, 7, 163, 151, 18, 57];
const DISC_EXECUTE_TRANSFER: [u8; 8] = [233, 126, 160, 184, 235, 206, 31, 119];
const DISC_REQUEST_APPROVAL: [u8; 8] = [14, 31, 134, 78, 89, 175, 45, 157];
const DISC_APPROVE_TRANSFER: [u8; 8] = [198, 217, 247, 150, 208, 60, 169, 244];
const DISC_REJECT_APPROVAL: [u8; 8] = [207, 76, 33, 119, 149, 1, 190, 146];
const DISC_EXPIRE_APPROVAL: [u8; 8] = [142, 157, 169, 147, 227, 39, 94, 189];
const DISC_EXECUTE_APPROVED_TRANSFER: [u8; 8] = [144, 128, 153, 201, 166, 243, 34, 184];
const DISC_DEACTIVATE_POLICY: [u8; 8] = [210, 232, 122, 110, 223, 75, 16, 26];
const DISC_REACTIVATE_POLICY: [u8; 8] = [16, 53, 195, 144, 92, 234, 1, 255];
const DISC_CLOSE_POLICY: [u8; 8] = [55, 42, 248, 229, 222, 138, 26, 252];
const DISC_RESET_DAILY_SPEND: [u8; 8] = [174, 162, 143, 213, 170, 123, 48, 42];

const PROGRAM_ID: Pubkey =
    solana_pubkey::pubkey!("6ufLBSxNADjAAS7NT5f9Phnvjxc2We7n7q8s9uKx5GBn");
const SYSTEM_PROGRAM: Pubkey = solana_pubkey::pubkey!("11111111111111111111111111111111");

// ── Helpers ───────────────────────────────────────────────────────────────────

fn setup() -> LiteSVM {
    let mut svm = LiteSVM::new();
    let so_path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../target/deploy/onleash.so");
    svm.add_program_from_file(PROGRAM_ID, so_path).unwrap();
    svm
}

fn policy_pda(agent: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"policy", agent.as_ref()], &PROGRAM_ID)
}

fn approval_pda(policy: &Pubkey, timestamp: i64) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"approval", policy.as_ref(), &timestamp.to_le_bytes()],
        &PROGRAM_ID,
    )
}

fn ix(disc: [u8; 8], args: impl BorshSerialize, accounts: Vec<AccountMeta>) -> Instruction {
    let mut data = disc.to_vec();
    borsh::to_writer(&mut data, &args).unwrap();
    Instruction { program_id: PROGRAM_ID, accounts, data }
}

fn send(svm: &mut LiteSVM, ix: Instruction, signers: &[&Keypair]) -> Result<(), String> {
    svm.expire_blockhash();
    let payer = signers[0].pubkey();
    let tx = Transaction::new(
        signers,
        Message::new(&[ix], Some(&payer)),
        svm.latest_blockhash(),
    );
    svm.send_transaction(tx)
        .map(|_| ())
        .map_err(|e| format!("{:?}", e))
}

// Borsh-serialized args for each instruction (mirror the on-chain structs).

#[derive(BorshSerialize)]
struct InitPolicyArgs {
    agent_wallet: [u8; 32],
    daily_cap: u64,
    per_vendor_cap: u64,
    approval_threshold: u64,
    blocklist: Vec<[u8; 32]>,
    allowlist: Vec<[u8; 32]>,
    allowlist_mode: bool,
}

#[derive(BorshSerialize)]
struct InitChildPolicyArgs {
    agent_wallet: [u8; 32],
    daily_cap: u64,
    per_vendor_cap: u64,
    approval_threshold: u64,
}

#[derive(BorshSerialize)]
struct UpdatePolicyArgs {
    daily_cap: u64,
    per_vendor_cap: u64,
    approval_threshold: u64,
    blocklist: Vec<[u8; 32]>,
    allowlist: Vec<[u8; 32]>,
    allowlist_mode: bool,
}

#[derive(BorshSerialize)]
struct ExecuteTransferArgs {
    amount: u64,
    recipient: [u8; 32],
}

#[derive(BorshSerialize)]
struct RequestApprovalArgs {
    amount: u64,
    recipient: [u8; 32],
    expires_at: i64,
    timestamp: i64,
}

// ── initialize_policy ─────────────────────────────────────────────────────────

fn init_policy_ix(
    owner: &Pubkey,
    agent: &Pubkey,
    daily_cap: u64,
    per_vendor_cap: u64,
    approval_threshold: u64,
    blocklist: Vec<Pubkey>,
    allowlist: Vec<Pubkey>,
    allowlist_mode: bool,
) -> Instruction {
    let (policy_pda, _) = policy_pda(agent);
    let args = InitPolicyArgs {
        agent_wallet: agent.to_bytes(),
        daily_cap,
        per_vendor_cap,
        approval_threshold,
        blocklist: blocklist.iter().map(|k| k.to_bytes()).collect(),
        allowlist: allowlist.iter().map(|k| k.to_bytes()).collect(),
        allowlist_mode,
    };
    ix(
        DISC_INITIALIZE_POLICY,
        args,
        vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new(*owner, true),
            AccountMeta::new_readonly(SYSTEM_PROGRAM, false),
        ],
    )
}

#[test]
fn test_initialize_policy_ok() {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();

    let result = send(
        &mut svm,
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), 1_000_000, 200_000, 500_000, vec![], vec![], false),
        &[&owner],
    );
    assert!(result.is_ok(), "initialize_policy should succeed: {result:?}");
}

#[test]
fn test_initialize_policy_zero_cap() {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();

    let err = send(
        &mut svm,
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), 0, 200_000, 500_000, vec![], vec![], false),
        &[&owner],
    )
    .unwrap_err();
    // InvalidCap = 6007 = 0x1777
    assert!(err.contains("0x1777"), "expected InvalidCap, got: {err}");
}

#[test]
fn test_initialize_policy_vendor_exceeds_daily() {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();

    let err = send(
        &mut svm,
        // per_vendor_cap (500) > daily_cap (100)
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), 100, 500, 50, vec![], vec![], false),
        &[&owner],
    )
    .unwrap_err();
    // VendorCapExceedsDailyCap = 6006 = 0x1776
    assert!(err.contains("0x1776"), "expected VendorCapExceedsDailyCap, got: {err}");
}

#[test]
fn test_initialize_policy_blocklist_too_large() {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();

    let blocklist: Vec<Pubkey> = (0..11).map(|_| Pubkey::new_unique()).collect();
    let err = send(
        &mut svm,
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), 1_000_000, 200_000, 500_000, blocklist, vec![], false),
        &[&owner],
    )
    .unwrap_err();
    // BlocklistTooLarge = 6012 = 0x177c
    assert!(err.contains("0x177c"), "expected BlocklistTooLarge, got: {err}");
}

// ── update_policy ─────────────────────────────────────────────────────────────

#[test]
fn test_update_policy_ok() {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();
    send(
        &mut svm,
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), 1_000_000, 200_000, 500_000, vec![], vec![], false),
        &[&owner],
    )
    .unwrap();

    let (policy_pda, _) = policy_pda(&agent.pubkey());
    let args = UpdatePolicyArgs {
        daily_cap: 2_000_000,
        per_vendor_cap: 500_000,
        approval_threshold: 750_000,
        blocklist: vec![],
        allowlist: vec![],
        allowlist_mode: false,
    };
    let result = send(
        &mut svm,
        ix(
            DISC_UPDATE_POLICY,
            args,
            vec![
                AccountMeta::new(policy_pda, false),
                AccountMeta::new_readonly(owner.pubkey(), true),
            ],
        ),
        &[&owner],
    );
    assert!(result.is_ok(), "update_policy should succeed: {result:?}");
}

// ── execute_transfer ──────────────────────────────────────────────────────────

fn execute_transfer_ix(agent: &Pubkey, recipient: &Pubkey, amount: u64) -> Instruction {
    let (policy_pda, _) = policy_pda(agent);
    let args = ExecuteTransferArgs {
        amount,
        recipient: recipient.to_bytes(),
    };
    ix(
        DISC_EXECUTE_TRANSFER,
        args,
        vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(PROGRAM_ID, false), // None sentinel for optional parent_policy
            AccountMeta::new_readonly(*agent, true),
        ],
    )
}

fn setup_with_policy(daily_cap: u64, per_vendor_cap: u64, approval_threshold: u64) -> (LiteSVM, Keypair, Keypair) {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();
    svm.airdrop(&agent.pubkey(), 10_000_000_000).unwrap();
    send(
        &mut svm,
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), daily_cap, per_vendor_cap, approval_threshold, vec![], vec![], false),
        &[&owner],
    )
    .unwrap();
    (svm, owner, agent)
}

#[test]
fn test_execute_transfer_ok() {
    let (mut svm, _owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let recipient = Pubkey::new_unique();

    let result = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &recipient, 100_000), &[&agent]);
    assert!(result.is_ok(), "execute_transfer should succeed: {result:?}");
}

#[test]
fn test_execute_transfer_zero_amount() {
    let (mut svm, _owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let recipient = Pubkey::new_unique();

    let err = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &recipient, 0), &[&agent]).unwrap_err();
    // ZeroAmount = 6008 = 0x1778
    assert!(err.contains("0x1778"), "expected ZeroAmount, got: {err}");
}

#[test]
fn test_execute_transfer_approval_required() {
    let (mut svm, _owner, agent) = setup_with_policy(1_000_000, 500_000, 500_000);
    let recipient = Pubkey::new_unique();

    // amount >= threshold triggers ApprovalRequired
    let err = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &recipient, 500_000), &[&agent]).unwrap_err();
    // ApprovalRequired = 6015 = 0x177f
    assert!(err.contains("0x177f"), "expected ApprovalRequired, got: {err}");
}

#[test]
fn test_execute_transfer_daily_cap_exceeded() {
    let (mut svm, _owner, agent) = setup_with_policy(300_000, 300_000, 900_000);
    let recipient = Pubkey::new_unique();

    send(&mut svm, execute_transfer_ix(&agent.pubkey(), &recipient, 200_000), &[&agent]).unwrap();
    // second transfer pushes total to 400_000 > 300_000
    let err = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &recipient, 200_000), &[&agent]).unwrap_err();
    // DailyCapExceeded = 6000 = 0x1770
    assert!(err.contains("0x1770"), "expected DailyCapExceeded, got: {err}");
}

#[test]
fn test_execute_transfer_vendor_cap_exceeded() {
    let (mut svm, _owner, agent) = setup_with_policy(1_000_000, 150_000, 900_000);
    let recipient = Pubkey::new_unique();

    send(&mut svm, execute_transfer_ix(&agent.pubkey(), &recipient, 100_000), &[&agent]).unwrap();
    // 100_000 + 100_000 = 200_000 > per_vendor_cap 150_000
    let err = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &recipient, 100_000), &[&agent]).unwrap_err();
    // VendorCapExceeded = 6001 = 0x1771
    assert!(err.contains("0x1771"), "expected VendorCapExceeded, got: {err}");
}

#[test]
fn test_execute_transfer_blocklisted() {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    let recipient = Pubkey::new_unique();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();
    svm.airdrop(&agent.pubkey(), 10_000_000_000).unwrap();

    send(
        &mut svm,
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), 1_000_000, 500_000, 900_000, vec![recipient], vec![], false),
        &[&owner],
    )
    .unwrap();

    let err = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &recipient, 100_000), &[&agent]).unwrap_err();
    // BlocklistedAddress = 6002 = 0x1772
    assert!(err.contains("0x1772"), "expected BlocklistedAddress, got: {err}");
}

#[test]
fn test_execute_transfer_policy_inactive() {
    let (mut svm, owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (policy_pda, _) = policy_pda(&agent.pubkey());

    // deactivate first
    send(
        &mut svm,
        ix(DISC_DEACTIVATE_POLICY, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap();

    let err = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &Pubkey::new_unique(), 100_000), &[&agent]).unwrap_err();
    // PolicyInactive = 6010 = 0x177a
    assert!(err.contains("0x177a"), "expected PolicyInactive, got: {err}");
}

// ── deactivate / reactivate / close ──────────────────────────────────────────

#[test]
fn test_deactivate_reactivate_ok() {
    let (mut svm, owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (policy_pda, _) = policy_pda(&agent.pubkey());

    send(
        &mut svm,
        ix(DISC_DEACTIVATE_POLICY, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap();

    send(
        &mut svm,
        ix(DISC_REACTIVATE_POLICY, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap();
}

#[test]
fn test_reactivate_already_active() {
    let (mut svm, owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (policy_pda, _) = policy_pda(&agent.pubkey());

    let err = send(
        &mut svm,
        ix(DISC_REACTIVATE_POLICY, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap_err();
    // PolicyAlreadyActive = 6031 = 0x178f
    assert!(err.contains("0x178f"), "expected PolicyAlreadyActive, got: {err}");
}

#[test]
fn test_close_policy_ok() {
    let (mut svm, owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (policy_pda, _) = policy_pda(&agent.pubkey());

    // must deactivate before closing
    send(
        &mut svm,
        ix(DISC_DEACTIVATE_POLICY, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap();

    send(
        &mut svm,
        ix(DISC_CLOSE_POLICY, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap();

    // account should be gone
    assert!(svm.get_account(&policy_pda).is_none(), "policy account should be closed");
}

#[test]
fn test_close_policy_still_active() {
    let (mut svm, owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (policy_pda, _) = policy_pda(&agent.pubkey());

    let err = send(
        &mut svm,
        ix(DISC_CLOSE_POLICY, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap_err();
    // PolicyStillActive = 6032 = 0x1790
    assert!(err.contains("0x1790"), "expected PolicyStillActive, got: {err}");
}

// ── approval flow ─────────────────────────────────────────────────────────────

fn request_approval_ix(agent: &Pubkey, recipient: &Pubkey, amount: u64, expires_at: i64, timestamp: i64) -> Instruction {
    let (policy_pda, _) = policy_pda(agent);
    let (approval_pda, _) = approval_pda(&policy_pda, timestamp);
    let args = RequestApprovalArgs {
        amount,
        recipient: recipient.to_bytes(),
        expires_at,
        timestamp,
    };
    ix(
        DISC_REQUEST_APPROVAL,
        args,
        vec![
            AccountMeta::new(approval_pda, false),
            AccountMeta::new_readonly(policy_pda, false),
            AccountMeta::new(*agent, true),
            AccountMeta::new_readonly(SYSTEM_PROGRAM, false),
        ],
    )
}

#[test]
fn test_full_approval_flow() {
    let (mut svm, owner, agent) = setup_with_policy(10_000_000, 5_000_000, 500_000);
    let recipient = Pubkey::new_unique();
    let (policy_pda, _) = policy_pda(&agent.pubkey());

    // amount >= threshold triggers approval path
    let amount = 600_000u64;
    let timestamp = 1_000_000i64;
    let expires_at = timestamp + 3600;
    let (approval_pda, _) = approval_pda(&policy_pda, timestamp);

    // 1. request
    send(
        &mut svm,
        request_approval_ix(&agent.pubkey(), &recipient, amount, expires_at, timestamp),
        &[&agent],
    )
    .unwrap();

    // 2. approve (owner)
    send(
        &mut svm,
        ix(DISC_APPROVE_TRANSFER, (), vec![
            AccountMeta::new(approval_pda, false),
            AccountMeta::new_readonly(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap();

    // 3. execute approved transfer (agent)
    send(
        &mut svm,
        ix(DISC_EXECUTE_APPROVED_TRANSFER, (), vec![
            AccountMeta::new(approval_pda, false),
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(PROGRAM_ID, false), // None sentinel for optional parent_policy
            AccountMeta::new(agent.pubkey(), true),
        ]),
        &[&agent],
    )
    .unwrap();

    // approval account should be closed (rent returned to agent)
    assert!(svm.get_account(&approval_pda).is_none(), "approval should be closed after execute");
}

#[test]
fn test_reject_approval() {
    let (mut svm, owner, agent) = setup_with_policy(10_000_000, 5_000_000, 500_000);
    let recipient = Pubkey::new_unique();
    let (policy_pda, _) = policy_pda(&agent.pubkey());
    let timestamp = 2_000_000i64;
    let (approval_pda, _) = approval_pda(&policy_pda, timestamp);

    send(
        &mut svm,
        request_approval_ix(&agent.pubkey(), &recipient, 600_000, timestamp + 3600, timestamp),
        &[&agent],
    )
    .unwrap();

    send(
        &mut svm,
        ix(DISC_REJECT_APPROVAL, (), vec![
            AccountMeta::new(approval_pda, false),
            AccountMeta::new_readonly(policy_pda, false),
            AccountMeta::new(agent.pubkey(), false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap();

    assert!(svm.get_account(&approval_pda).is_none(), "approval should be closed after reject");
}

#[test]
fn test_expire_approval() {
    let (mut svm, _owner, agent) = setup_with_policy(10_000_000, 5_000_000, 500_000);
    let recipient = Pubkey::new_unique();
    let (policy_pda, _) = policy_pda(&agent.pubkey());
    // Use a timestamp far in the past so the approval is already expired
    let timestamp = 1i64;
    let _expires_at = 2i64; // definitely in the past
    // request_approval requires expires_at > clock.unix_timestamp — we can't
    // create an already-expired approval through the normal path; instead verify
    // that expire_approval rejects a non-expired one.
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;
    let valid_expires_at = now + 3600;
    let ts = now;
    let (stale_pda, _) = approval_pda(&policy_pda, timestamp);
    let (live_approval_pda, _) = approval_pda(&policy_pda, ts);

    send(
        &mut svm,
        request_approval_ix(&agent.pubkey(), &recipient, 600_000, valid_expires_at, ts),
        &[&agent],
    )
    .unwrap();

    // should fail: not yet expired
    let err = send(
        &mut svm,
        ix(DISC_EXPIRE_APPROVAL, (), vec![
            AccountMeta::new(live_approval_pda, false),
            AccountMeta::new(agent.pubkey(), false),
        ]),
        &[&agent],
    )
    .unwrap_err();
    // ApprovalNotExpired = 6030 = 0x178e
    assert!(err.contains("0x178e"), "expected ApprovalNotExpired, got: {err}");
    let _ = stale_pda;
}

#[test]
fn test_request_approval_below_threshold() {
    let (mut svm, _owner, agent) = setup_with_policy(1_000_000, 500_000, 500_000);
    let recipient = Pubkey::new_unique();
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64;

    // amount < threshold → BelowApprovalThreshold
    let err = send(
        &mut svm,
        request_approval_ix(&agent.pubkey(), &recipient, 100_000, now + 3600, now),
        &[&agent],
    )
    .unwrap_err();
    // BelowApprovalThreshold = 6017 = 0x1781
    assert!(err.contains("0x1781"), "expected BelowApprovalThreshold, got: {err}");
}

// ── initialize_child_policy ───────────────────────────────────────────────────

#[test]
fn test_initialize_child_policy_ok() {
    let (mut svm, owner, parent_agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (parent_pda, _) = policy_pda(&parent_agent.pubkey());

    let child_agent = Keypair::new();
    let (child_pda, _) = policy_pda(&child_agent.pubkey());
    let args = InitChildPolicyArgs {
        agent_wallet: child_agent.pubkey().to_bytes(),
        daily_cap: 500_000,
        per_vendor_cap: 200_000,
        approval_threshold: 400_000,
    };
    let result = send(
        &mut svm,
        ix(DISC_INITIALIZE_CHILD_POLICY, args, vec![
            AccountMeta::new(child_pda, false),
            AccountMeta::new(parent_pda, false),
            AccountMeta::new(owner.pubkey(), true),
            AccountMeta::new_readonly(SYSTEM_PROGRAM, false),
        ]),
        &[&owner],
    );
    assert!(result.is_ok(), "initialize_child_policy should succeed: {result:?}");
}

#[test]
fn test_child_policy_cap_exceeds_parent() {
    let (mut svm, owner, parent_agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (parent_pda, _) = policy_pda(&parent_agent.pubkey());

    let child_agent = Keypair::new();
    let (child_pda, _) = policy_pda(&child_agent.pubkey());
    let args = InitChildPolicyArgs {
        agent_wallet: child_agent.pubkey().to_bytes(),
        daily_cap: 2_000_000, // exceeds parent 1_000_000
        per_vendor_cap: 200_000,
        approval_threshold: 400_000,
    };
    let err = send(
        &mut svm,
        ix(DISC_INITIALIZE_CHILD_POLICY, args, vec![
            AccountMeta::new(child_pda, false),
            AccountMeta::new(parent_pda, false),
            AccountMeta::new(owner.pubkey(), true),
            AccountMeta::new_readonly(SYSTEM_PROGRAM, false),
        ]),
        &[&owner],
    )
    .unwrap_err();
    // ChildCapExceedsParent = 6005 = 0x1775
    assert!(err.contains("0x1775"), "expected ChildCapExceedsParent, got: {err}");
}

// ── allowlist mode ────────────────────────────────────────────────────────────

#[test]
fn test_allowlist_mode_blocks_unlisted() {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    let allowed = Pubkey::new_unique();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();
    svm.airdrop(&agent.pubkey(), 10_000_000_000).unwrap();

    send(
        &mut svm,
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), 1_000_000, 500_000, 900_000, vec![], vec![allowed], true),
        &[&owner],
    )
    .unwrap();

    let unlisted = Pubkey::new_unique();
    let err = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &unlisted, 100_000), &[&agent]).unwrap_err();
    // AddressNotAllowlisted = 6003 = 0x1773
    assert!(err.contains("0x1773"), "expected AddressNotAllowlisted, got: {err}");
}

#[test]
fn test_allowlist_mode_allows_listed() {
    let mut svm = setup();
    let owner = Keypair::new();
    let agent = Keypair::new();
    let allowed = Pubkey::new_unique();
    svm.airdrop(&owner.pubkey(), 10_000_000_000).unwrap();
    svm.airdrop(&agent.pubkey(), 10_000_000_000).unwrap();

    send(
        &mut svm,
        init_policy_ix(&owner.pubkey(), &agent.pubkey(), 1_000_000, 500_000, 900_000, vec![], vec![allowed], true),
        &[&owner],
    )
    .unwrap();

    let result = send(&mut svm, execute_transfer_ix(&agent.pubkey(), &allowed, 100_000), &[&agent]);
    assert!(result.is_ok(), "allowlisted address should pass: {result:?}");
}

// ── reset_daily_spend ─────────────────────────────────────────────────────────

#[test]
fn test_reset_daily_spend_ok() {
    let (mut svm, owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (policy_pda, _) = policy_pda(&agent.pubkey());

    let result = send(
        &mut svm,
        ix(DISC_RESET_DAILY_SPEND, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    );
    assert!(result.is_ok(), "reset_daily_spend should succeed: {result:?}");
}

#[test]
fn test_reset_daily_spend_inactive() {
    let (mut svm, owner, agent) = setup_with_policy(1_000_000, 500_000, 900_000);
    let (policy_pda, _) = policy_pda(&agent.pubkey());

    send(
        &mut svm,
        ix(DISC_DEACTIVATE_POLICY, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap();

    let err = send(
        &mut svm,
        ix(DISC_RESET_DAILY_SPEND, (), vec![
            AccountMeta::new(policy_pda, false),
            AccountMeta::new_readonly(owner.pubkey(), true),
        ]),
        &[&owner],
    )
    .unwrap_err();
    // PolicyInactive = 6010 = 0x177a
    assert!(err.contains("0x177a"), "expected PolicyInactive, got: {err}");
}
