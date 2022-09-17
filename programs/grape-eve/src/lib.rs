use anchor_lang::prelude::*;
mod error_codes;
mod instructions;
mod states;
mod utils;

use instructions::*;

declare_id!("evebL3R4wYwkYETcMfNEjgu1zDQ5VyXgJQF1pyAmzaL");

#[program]
pub mod grape_eve {
    use super::*;

    pub fn create_thread(ctx: Context<CreateThreadContext>, args: CreateThreadArgs) -> Result<()> {
        create_thread::create_thread(ctx, args)
    }

    pub fn update_thread(ctx: Context<UpdateThreadContext>, args: UpdateThreadArgs) -> Result<()> {
        update_thread::update_thread(ctx, args)
    }

    pub fn delete_thread(ctx: Context<DeleteThread>) -> Result<()> {
        delete_thread::delete_thread(ctx)
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
    ) -> Result<()> {
        edit_community::edit_community(ctx, args)
    }

    pub fn delete_community(ctx: Context<DeleteCommunity>) -> Result<()> {
        delete_community::delete_community(ctx)
    }
}
