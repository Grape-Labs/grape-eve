use crate::error_codes::errors::Errors;
use crate::states::thread::Thread;
use crate::states::thread::THREAD;
use crate::states::community::COMMUNITY;
use anchor_lang::prelude::*;
use crate::states::community::Community;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct UpdatePostArgs {
    pub reply_to: Pubkey,
    pub thread_type: u8,
    pub is_encrypted: bool,
    pub topic: String,
    pub content: String,
    pub metadata: String,
    pub ends: u64,
}

#[derive(Accounts)]
#[instruction(args: UpdatePostArgs)]
pub struct UpdatePostContext<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(mut,
    has_one=author,
    seeds=[THREAD.as_bytes(), thread.uuid.as_bytes()],
    bump=thread.bump
    )]
    pub thread: Account<'info, Thread>,
    #[account(
    seeds=[COMMUNITY.as_bytes(), community.title.as_bytes()],
    bump=community.bump
    )]
    pub community: Account<'info, Community>,
}

pub fn update_post(ctx: Context<UpdatePostContext>, args: UpdatePostArgs) -> Result<()> {
    let thread: &mut Account<Thread> = &mut ctx.accounts.thread;
    if args.topic.chars().count() > 50 {
        return Err(Errors::TopicTooLong.into());
    }

    if args.content.chars().count() > 280 {
        return Err(Errors::ContentTooLong.into());
    }

    let bump = thread.bump;
    let uuid = thread.uuid.clone();
    
    thread.update(bump,
                  ctx.accounts.author.key(),
                  Clock::get().unwrap().unix_timestamp as u64,
                  args.ends,
                  ctx.accounts.community.key(),
                  args.reply_to,
                  args.thread_type,
                  args.is_encrypted,
                  args.topic,
                  args.content,
                  args.metadata,
                  uuid);
    Ok(())
}
