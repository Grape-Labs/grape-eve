mod utils;
mod states;
mod error_codes;
mod instructions;

use instructions::*;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("2rbW644hAFC43trjcsbrpPQjGvUHz6q3k4D3kZYSZigB");

#[program]
pub mod grape_eve {
    use super::*;

    pub fn send_post(ctx: Context<SendPost>, topic: String, content: String, metadata: String, thread_type: u8, is_encrypted: bool, community: Option<Pubkey>, reply: Option<Pubkey>) -> Result<()> {
        send_post::send_post(ctx, topic, content, metadata, thread_type, is_encrypted, community, reply)
    }

    pub fn delete_post(_ctx: Context<DeletePost>) -> Result<()> {
        delete_post::delete_post(_ctx)
    }

    pub fn update_post(ctx: Context<UpdatePost>, topic: String, content: String) -> Result<()> {
        update_post::update_post(ctx, topic, content)
    }
}

