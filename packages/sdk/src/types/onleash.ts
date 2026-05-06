/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/onleash.json`.
 */
export type Onleash = {
  "address": "6ufLBSxNADjAAS7NT5f9Phnvjxc2We7n7q8s9uKx5GBn",
  "metadata": {
    "name": "onleash",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "OnLeash — Spend control program for AI agent wallets on Solana"
  },
  "instructions": [
    {
      "name": "approveTransfer",
      "discriminator": [
        198,
        217,
        247,
        150,
        208,
        60,
        169,
        244
      ],
      "accounts": [
        {
          "name": "approval",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  114,
                  111,
                  118,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "approval.policy",
                "account": "approvalAccount"
              },
              {
                "kind": "account",
                "path": "approval.seed_timestamp",
                "account": "approvalAccount"
              }
            ]
          }
        },
        {
          "name": "policy",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "closePolicy",
      "discriminator": [
        55,
        42,
        248,
        229,
        222,
        138,
        26,
        252
      ],
      "accounts": [
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "deactivatePolicy",
      "discriminator": [
        210,
        232,
        122,
        110,
        223,
        75,
        16,
        26
      ],
      "accounts": [
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "executeApprovedTransfer",
      "discriminator": [
        144,
        128,
        153,
        201,
        166,
        243,
        34,
        184
      ],
      "accounts": [
        {
          "name": "approval",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  114,
                  111,
                  118,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "approval.policy",
                "account": "approvalAccount"
              },
              {
                "kind": "account",
                "path": "approval.seed_timestamp",
                "account": "approvalAccount"
              }
            ]
          }
        },
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "parentPolicy",
          "writable": true,
          "optional": true
        },
        {
          "name": "agent",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "executeTransfer",
      "discriminator": [
        233,
        126,
        160,
        184,
        235,
        206,
        31,
        119
      ],
      "accounts": [
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "parentPolicy",
          "writable": true,
          "optional": true
        },
        {
          "name": "agent",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "recipient",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "expireApproval",
      "discriminator": [
        142,
        157,
        169,
        147,
        227,
        39,
        94,
        189
      ],
      "accounts": [
        {
          "name": "approval",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  114,
                  111,
                  118,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "approval.policy",
                "account": "approvalAccount"
              },
              {
                "kind": "account",
                "path": "approval.seed_timestamp",
                "account": "approvalAccount"
              }
            ]
          }
        },
        {
          "name": "agent",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeChildPolicy",
      "discriminator": [
        8,
        39,
        46,
        255,
        157,
        15,
        112,
        220
      ],
      "accounts": [
        {
          "name": "childPolicy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "params.agent_wallet"
              }
            ]
          }
        },
        {
          "name": "parentPolicy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "parent_policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initializeChildPolicyParams"
            }
          }
        }
      ]
    },
    {
      "name": "initializePolicy",
      "discriminator": [
        9,
        186,
        86,
        225,
        129,
        162,
        231,
        56
      ],
      "accounts": [
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "params.agent_wallet"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "initializePolicyParams"
            }
          }
        }
      ]
    },
    {
      "name": "reactivatePolicy",
      "discriminator": [
        16,
        53,
        195,
        144,
        92,
        234,
        1,
        255
      ],
      "accounts": [
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "rejectApproval",
      "discriminator": [
        207,
        76,
        33,
        119,
        149,
        1,
        190,
        146
      ],
      "accounts": [
        {
          "name": "approval",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  114,
                  111,
                  118,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "approval.policy",
                "account": "approvalAccount"
              },
              {
                "kind": "account",
                "path": "approval.seed_timestamp",
                "account": "approvalAccount"
              }
            ]
          }
        },
        {
          "name": "policy",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "agent",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "requestApproval",
      "discriminator": [
        14,
        31,
        134,
        78,
        89,
        175,
        45,
        157
      ],
      "accounts": [
        {
          "name": "approval",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  112,
                  112,
                  114,
                  111,
                  118,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "policy"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "policy",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "agent",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "recipient",
          "type": "pubkey"
        },
        {
          "name": "expiresAt",
          "type": "i64"
        },
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    },
    {
      "name": "resetDailySpend",
      "discriminator": [
        174,
        162,
        143,
        213,
        170,
        123,
        48,
        42
      ],
      "accounts": [
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "updatePolicy",
      "discriminator": [
        212,
        245,
        246,
        7,
        163,
        151,
        18,
        57
      ],
      "accounts": [
        {
          "name": "policy",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  108,
                  105,
                  99,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "policy.agent_wallet",
                "account": "policyAccount"
              }
            ]
          }
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "updatePolicyParams"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "approvalAccount",
      "discriminator": [
        169,
        84,
        59,
        29,
        166,
        124,
        3,
        234
      ]
    },
    {
      "name": "policyAccount",
      "discriminator": [
        218,
        201,
        183,
        164,
        156,
        127,
        81,
        175
      ]
    }
  ],
  "events": [
    {
      "name": "approvalExpired",
      "discriminator": [
        27,
        64,
        168,
        179,
        198,
        54,
        46,
        27
      ]
    },
    {
      "name": "approvalGranted",
      "discriminator": [
        193,
        178,
        86,
        39,
        242,
        232,
        34,
        0
      ]
    },
    {
      "name": "approvalRejected",
      "discriminator": [
        113,
        40,
        207,
        170,
        194,
        195,
        17,
        217
      ]
    },
    {
      "name": "approvalRequested",
      "discriminator": [
        114,
        39,
        81,
        245,
        166,
        50,
        236,
        254
      ]
    },
    {
      "name": "approvedTransferExecuted",
      "discriminator": [
        180,
        99,
        24,
        44,
        6,
        198,
        156,
        13
      ]
    },
    {
      "name": "childPolicyInitialized",
      "discriminator": [
        39,
        24,
        42,
        155,
        94,
        67,
        176,
        31
      ]
    },
    {
      "name": "dailySpendReset",
      "discriminator": [
        249,
        222,
        129,
        61,
        176,
        202,
        71,
        158
      ]
    },
    {
      "name": "policyClosed",
      "discriminator": [
        19,
        126,
        82,
        173,
        79,
        86,
        50,
        51
      ]
    },
    {
      "name": "policyDeactivated",
      "discriminator": [
        206,
        178,
        22,
        255,
        87,
        227,
        170,
        231
      ]
    },
    {
      "name": "policyInitialized",
      "discriminator": [
        102,
        184,
        59,
        178,
        235,
        69,
        251,
        181
      ]
    },
    {
      "name": "policyReactivated",
      "discriminator": [
        7,
        8,
        164,
        15,
        184,
        21,
        10,
        32
      ]
    },
    {
      "name": "policyUpdated",
      "discriminator": [
        225,
        112,
        112,
        67,
        95,
        236,
        245,
        161
      ]
    },
    {
      "name": "transferExecuted",
      "discriminator": [
        8,
        128,
        224,
        132,
        112,
        216,
        192,
        35
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "dailyCapExceeded",
      "msg": "Daily cap exceeded — transfer blocked by OnLeash"
    },
    {
      "code": 6001,
      "name": "vendorCapExceeded",
      "msg": "Per-vendor cap exceeded — too much sent to this address today"
    },
    {
      "code": 6002,
      "name": "blocklistedAddress",
      "msg": "Address is on the blocklist"
    },
    {
      "code": 6003,
      "name": "addressNotAllowlisted",
      "msg": "Address is not on the allowlist"
    },
    {
      "code": 6004,
      "name": "parentDailyCapExceeded",
      "msg": "Parent agent daily cap exceeded"
    },
    {
      "code": 6005,
      "name": "childCapExceedsParent",
      "msg": "Child daily cap cannot exceed parent daily cap"
    },
    {
      "code": 6006,
      "name": "vendorCapExceedsDailyCap",
      "msg": "Per-vendor cap cannot exceed daily cap"
    },
    {
      "code": 6007,
      "name": "invalidCap",
      "msg": "Cap must be greater than zero"
    },
    {
      "code": 6008,
      "name": "zeroAmount",
      "msg": "Transfer amount must be greater than zero"
    },
    {
      "code": 6009,
      "name": "overflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6010,
      "name": "policyInactive",
      "msg": "Policy is inactive — transfers permanently disabled"
    },
    {
      "code": 6011,
      "name": "unauthorized",
      "msg": "Unauthorized — only owner can perform this action"
    },
    {
      "code": 6012,
      "name": "blocklistTooLarge",
      "msg": "Blocklist is full — maximum 10 addresses"
    },
    {
      "code": 6013,
      "name": "allowlistTooLarge",
      "msg": "Allowlist is full — maximum 20 addresses"
    },
    {
      "code": 6014,
      "name": "tooManyVendors",
      "msg": "Too many vendor entries — maximum 20 vendors tracked per day"
    },
    {
      "code": 6015,
      "name": "approvalRequired",
      "msg": "Transfer amount exceeds approval threshold – Telegram approval required"
    },
    {
      "code": 6016,
      "name": "childPerVendorCapExceedsParent",
      "msg": "Child per-vendor cap cannot exceed parent per-vendor cap"
    },
    {
      "code": 6017,
      "name": "belowApprovalThreshold",
      "msg": "Amount is below approval threshold"
    },
    {
      "code": 6018,
      "name": "approvalNotPending",
      "msg": "Approval is not in pending status"
    },
    {
      "code": 6019,
      "name": "approvalNotGranted",
      "msg": "Approval has not been granted"
    },
    {
      "code": 6020,
      "name": "approvalExpired",
      "msg": "Approval has expired"
    },
    {
      "code": 6021,
      "name": "approvalPolicyMismatch",
      "msg": "Approval policy does not match"
    },
    {
      "code": 6022,
      "name": "invalidExpiry",
      "msg": "Invalid expiry timestamp"
    },
    {
      "code": 6023,
      "name": "parentBlocklistedAddress",
      "msg": "Address is on the parent policy blocklist"
    },
    {
      "code": 6024,
      "name": "parentAddressNotAllowlisted",
      "msg": "Address is not on the parent policy allowlist"
    },
    {
      "code": 6025,
      "name": "parentVendorCapExceeded",
      "msg": "Parent per-vendor cap exceeded"
    },
    {
      "code": 6026,
      "name": "missingParentPolicy",
      "msg": "Parent policy is required but not provided"
    },
    {
      "code": 6027,
      "name": "unexpectedParentPolicy",
      "msg": "Unexpected parent policy provided (policy has no parent)"
    },
    {
      "code": 6028,
      "name": "parentPolicyMismatch",
      "msg": "Provided parent policy does not match the expected policy PDA"
    },
    {
      "code": 6029,
      "name": "invalidParentPda",
      "msg": "Invalid parent policy PDA"
    },
    {
      "code": 6030,
      "name": "approvalNotExpired",
      "msg": "Approval has not yet expired"
    },
    {
      "code": 6031,
      "name": "policyAlreadyActive",
      "msg": "Policy is already active"
    },
    {
      "code": 6032,
      "name": "policyStillActive",
      "msg": "Policy must be deactivated before closing"
    }
  ],
  "types": [
    {
      "name": "approvalAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "agentWallet",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "approvalStatus"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "seedTimestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "approvalExpired",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "approval",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "approvalGranted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "approval",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "approvalRejected",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "approval",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "approvalRequested",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "approval",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "approvalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          },
          {
            "name": "expired"
          },
          {
            "name": "used"
          }
        ]
      }
    },
    {
      "name": "approvedTransferExecuted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "approval",
            "type": "pubkey"
          },
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "spentToday",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "childPolicyInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "childPolicy",
            "type": "pubkey"
          },
          {
            "name": "parentPolicy",
            "type": "pubkey"
          },
          {
            "name": "agentWallet",
            "type": "pubkey"
          },
          {
            "name": "dailyCap",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "dailySpendReset",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "resetAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "initializeChildPolicyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agentWallet",
            "type": "pubkey"
          },
          {
            "name": "dailyCap",
            "type": "u64"
          },
          {
            "name": "perVendorCap",
            "type": "u64"
          },
          {
            "name": "approvalThreshold",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "initializePolicyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "agentWallet",
            "type": "pubkey"
          },
          {
            "name": "dailyCap",
            "type": "u64"
          },
          {
            "name": "perVendorCap",
            "type": "u64"
          },
          {
            "name": "approvalThreshold",
            "type": "u64"
          },
          {
            "name": "blocklist",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "allowlist",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "allowlistMode",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "policyAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "agentWallet",
            "type": "pubkey"
          },
          {
            "name": "dailyCap",
            "type": "u64"
          },
          {
            "name": "perVendorCap",
            "type": "u64"
          },
          {
            "name": "approvalThreshold",
            "type": "u64"
          },
          {
            "name": "blocklist",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "allowlist",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "allowlistMode",
            "type": "bool"
          },
          {
            "name": "spentToday",
            "type": "u64"
          },
          {
            "name": "vendorEntries",
            "type": {
              "vec": {
                "defined": {
                  "name": "vendorEntry"
                }
              }
            }
          },
          {
            "name": "lastReset",
            "type": "i64"
          },
          {
            "name": "parentPolicy",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "version",
            "type": "u32"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "policyClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "agentWallet",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "policyDeactivated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "policyInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "agentWallet",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "policyReactivated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "policyUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "version",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "transferExecuted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "policy",
            "type": "pubkey"
          },
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "spentToday",
            "type": "u64"
          },
          {
            "name": "dailyCap",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "updatePolicyParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dailyCap",
            "type": "u64"
          },
          {
            "name": "perVendorCap",
            "type": "u64"
          },
          {
            "name": "approvalThreshold",
            "type": "u64"
          },
          {
            "name": "blocklist",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "allowlist",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "allowlistMode",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "vendorEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
