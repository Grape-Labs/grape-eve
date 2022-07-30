use crate::states::community::Community;
use crate::states::community::COMMUNITY;
use crate::states::thread::Thread;
use crate::states::thread::THREAD;
use crate::utils::helpers::{check_community_access, check_content_length, check_topic_length, pub_key_from_str};
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, TokenAccount};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateThreadArgs {
    pub reply_to: String,
    pub thread_type: u8,
    pub is_encrypted: bool,
    pub topic: String,
    pub content: String,
    pub metadata: String,
    pub ends: u64,
    pub uuid: String,
}

#[derive(Accounts)]
#[instruction(args: CreateThreadArgs)]
pub struct CreateThreadContext<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(init,
    payer=author,
    space=Thread::SIZE,
    seeds=[THREAD.as_bytes(), args.uuid.as_bytes()],
    bump
    )]
    pub thread: Account<'info, Thread>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
    seeds=[COMMUNITY.as_bytes(), community.uuid.as_bytes()],
    has_one=mint,
    bump=community.bump
    )]
    pub community: Account<'info, Community>,
    #[account(
    mut,
    associated_token::mint=mint,
    associated_token::authority=author,
    )]
    pub author_token_account: Box<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_thread(ctx: Context<CreateThreadContext>, args: CreateThreadArgs) -> Result<()> {
    let thread: &mut Account<Thread> = &mut ctx.accounts.thread;
    let author_token_account = &ctx.accounts.author_token_account;
    let mint = &ctx.accounts.mint;
    let reply_to = pub_key_from_str(args.reply_to)?;

    check_community_access(author_token_account, mint.to_account_info())?;
    check_topic_length(&args.topic)?;
    check_content_length(&args.content)?;

    thread.update(
        *ctx.bumps.get("thread").unwrap(),
        ctx.accounts.author.key(),
        Clock::get().unwrap().unix_timestamp as u64,
        args.ends as u64,
        ctx.accounts.community.key(),
        reply_to,
        args.thread_type,
        args.is_encrypted,
        args.topic,
        args.content,
        args.metadata,
        args.uuid,
    );

    Ok(())
}
