mod error_codes;
mod instructions;
mod states;
mod utils;

use instructions::*;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("2rbW644hAFC43trjcsbrpPQjGvUHz6q3k4D3kZYSZigB");

#[program]
pub mod grape_eve {
    use super::*;


    pub fn send_post(
        ctx: Context<SendPostContext>,
        args: SendPostArgs,
    ) -> Result<()> {
        send_post::send_post(ctx, args)
    }

    pub fn delete_post(_ctx: Context<DeletePost>) -> Result<()> {
        delete_post::delete_post(_ctx)
    }

    pub fn update_post(ctx: Context<UpdatePostContext>, args: UpdatePostArgs) -> Result<()> {
        update_post::update_post(ctx, args)
    }

    pub fn create_community(
        ctx: Context<CreateCommunityContext>,
        args: CreateCommunityArgs,
    ) -> Result<()> {
        create_community::create_community(ctx, args)
    }


    pub fn edit_community(
        ctx: Context<EditCommunityContext>,
        args: EditCommunityArgs,
    ) -> Result<()>
    {
        edit_community::edit_community(ctx, args)
    }
}
