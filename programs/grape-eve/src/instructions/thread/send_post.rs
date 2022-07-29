use crate::error_codes::errors::Errors;
use crate::states::thread::Thread;
use crate::states::thread::THREAD;
use crate::states::community::COMMUNITY;
use anchor_lang::prelude::*;
use crate::states::community::Community;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SendPostArgs {
    pub reply_to: Pubkey,
    pub thread_type: u8,
    pub is_encrypted: bool,
    pub topic: String,
    pub content: String,
    pub metadata: String,
    pub uuid: String
}

#[derive(Accounts)]
#[instruction(args: SendPostArgs)]
pub struct SendPostContext<'info> {
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(init,
    payer=author,
    space=Thread::SIZE,
    seeds=[THREAD.as_bytes(), args.uuid.as_bytes()],
    bump
    )]
    pub thread: Account<'info, Thread>,
    #[account(
    seeds=[COMMUNITY.as_bytes(), community.title.as_bytes()],
    bump=community.bump
    )]
    pub community: Account<'info, Community>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn send_post(
    ctx: Context<SendPostContext>,
    args: SendPostArgs,
) -> Result<()> {
    let thread: &mut Account<Thread> = &mut ctx.accounts.thread;

    if args.topic.chars().count() > 50 {
        return Err(Errors::TopicTooLong.into());
    }

    if args.content.chars().count() > 280 {
        return Err(Errors::ContentTooLong.into());
    }

    thread.update(*ctx.bumps.get("thread").unwrap(),
                  ctx.accounts.author.key(),
                  Clock::get().unwrap().unix_timestamp as u64,
                  ctx.accounts.community.key(),
                  args.reply_to,
                  args.thread_type,
                  args.is_encrypted,
                  args.topic,
                  args.content,
                  args.metadata,
                  args.uuid);

    Ok(())
}
