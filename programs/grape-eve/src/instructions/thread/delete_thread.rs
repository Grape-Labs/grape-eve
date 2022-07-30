use crate::states::community::Community;
use crate::states::community::COMMUNITY;
use crate::states::thread::Thread;
use crate::states::thread::THREAD;
use crate::utils::helpers::check_community_access;
use anchor_lang::prelude::*;
use anchor_lang::AccountsClose;
use anchor_spl::token::{Mint, TokenAccount};

#[derive(Accounts)]
pub struct DeleteThread<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(mut,
    has_one=author,
    seeds=[THREAD.as_bytes(), thread.uuid.as_bytes()],
    has_one=community,
    bump=thread.bump
    )]
    pub thread: Account<'info, Thread>,
    #[account(
    seeds=[COMMUNITY.as_bytes(), community.uuid.as_bytes()],
    bump=community.bump
    )]
    pub community: Account<'info, Community>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
    mut,
    associated_token::mint=mint,
    associated_token::authority=author,
    )]
    pub author_token_account: Box<Account<'info, TokenAccount>>,
}

pub fn delete_thread(ctx: Context<DeleteThread>) -> Result<()> {
    let thread = &ctx.accounts.thread;
    let author = &ctx.accounts.author;
    let mint = &ctx.accounts.mint;
    let author_token_account = &ctx.accounts.author_token_account;

    check_community_access(author_token_account, mint.to_account_info())?;
    thread.close(author.to_account_info())?;
    Ok(())
}
