use crate::states::community::Community;
use crate::states::community::COMMUNITY;
use crate::states::thread::Thread;
use crate::states::thread::THREAD;
use crate::utils::helpers::{check_community_access, check_content_length, check_topic_length, pub_key_from_str};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdateThreadArgs {
    pub reply_to: String,
    pub thread_type: u8,
    pub is_encrypted: bool,
    pub topic: String,
    pub content: String,
    pub metadata: String,
    pub ends: u64,
}

#[derive(Accounts)]
#[instruction(args: UpdateThreadArgs)]
pub struct UpdateThreadContext<'info> {
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

pub fn update_thread(ctx: Context<UpdateThreadContext>, args: UpdateThreadArgs) -> Result<()> {
    let thread: &mut Account<Thread> = &mut ctx.accounts.thread;
    let mint = &ctx.accounts.mint;
    let author_token_account = &ctx.accounts.author_token_account;
    let reply_to = pub_key_from_str(args.reply_to)?;

    check_community_access(author_token_account, mint.to_account_info())?;
    check_topic_length(&args.topic)?;
    check_content_length(&args.content)?;

    let bump = thread.bump;
    let uuid = thread.uuid.clone();

    thread.update(
        bump,
        ctx.accounts.author.key(),
        Clock::get().unwrap().unix_timestamp as u64,
        args.ends,
        ctx.accounts.community.key(),
        reply_to,
        args.thread_type,
        args.is_encrypted,
        args.topic,
        args.content,
        args.metadata,
        uuid,
    );
    Ok(())
}
