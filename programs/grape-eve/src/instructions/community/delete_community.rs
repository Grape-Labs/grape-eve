use crate::states::community::Community;
use anchor_lang::prelude::*;
use anchor_lang::AccountsClose;
//use crate::utils::helpers::{check_thread_exists};

#[derive(Accounts)]
pub struct DeleteCommunity<'info> {
    //#[account(mut, has_one = author, close = author)]
    #[account(mut)]
    pub community: Account<'info, Community>,
    pub author: Signer<'info>,
}

pub fn delete_community(ctx: Context<DeleteCommunity>) -> Result<()> {
    //let author = &ctx.accounts.author;
    //community.close(author.to_account_info())?;
    let community: &Account<Community> = &ctx.accounts.community;
    let author: &Signer = &ctx.accounts.author;
    //check_no_threads_exist function needed todo
    //check_thread_exists(ctx: community.to_account_info().key)?;
    //check_thread_exists(community.to_account_info())?;
    community.close(author.to_account_info())?;

    Ok(())
}
