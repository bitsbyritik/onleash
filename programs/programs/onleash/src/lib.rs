use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;

declare_id!("71XPKUg1c8rHuKHZ9pmvfrPkREwXHPQKtndQyDJWWSDS");

#[program]
pub mod onleash {
    use super::*;

    pub use instructions::*;
}
