use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("7pjxFfT8Md94mbsujhdSvHYApKzLjVZLbH5dsZHfy6xN");

#[program]
pub mod grape_eve {
    use super::*;
    pub fn send_post(ctx: Context<SendPost>, topic: String, content: String, metadata: String, community_type: i8, is_encrypted: i8, community: Option<Pubkey>, reply: Option<Pubkey>) -> ProgramResult {
        let thread: &mut Account<Thread> = &mut ctx.accounts.thread;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();
        
        if topic.chars().count() > 50 {
            return Err(ErrorCode::TopicTooLong.into())
        }
        
        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }
        
        thread.author = *author.key;
        thread.timestamp = clock.unix_timestamp;
        thread.topic = topic;
        thread.content = content;
        thread.metadata = metadata;
        thread.community_type = community_type;
        thread.is_encrypted = is_encrypted;
        thread.community = community;
        thread.reply = reply;

        Ok(())
    }

    pub fn update_post(ctx: Context<UpdatePost>, topic: String, content: String) -> ProgramResult {
        let thread: &mut Account<Thread> = &mut ctx.accounts.thread;

        if topic.chars().count() > 50 {
            return Err(ErrorCode::TopicTooLong.into())
        }

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }

        thread.topic = topic;
        thread.content = content;

        Ok(())
    }

    pub fn delete_post(_ctx: Context<DeletePost>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendPost<'info> {
    #[account(init, payer = author, space = Thread::LEN)]
    pub thread: Account<'info, Thread>,
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(address = system_program::ID)]
    //pub system_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePost<'info> {
    #[account(mut, has_one = author)]
    pub thread: Account<'info, Thread>,
    pub author: Signer<'info>,
    //pub community: Signer<'info>,
    //pub communityType: Signer<'info>,
    //pub metadata: Signer<'info>,
    //pub isEncrypted: Signer<'info>,
    //pub reply: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeletePost<'info> {
    #[account(mut, has_one = author, close = author)]
    pub thread: Account<'info, Thread>,
    pub author: Signer<'info>,
}

#[account]
pub struct Thread {
    pub author: Pubkey,
    pub timestamp: i64,
    pub community: Option<Pubkey>,
    pub reply: Option<Pubkey>,
    pub community_type: i8,
    pub is_encrypted: i8,
    pub topic: String,
    pub content: String,
    pub metadata: String,
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max.
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max.
const METADATA_LENGTH: usize = 280 * 4;
const COMMUNITYTYPE_LENGTH: usize = 1;
const ISENCRYPTED_LENGTH: usize = 1;
const COMMUNITY_LENGTH: usize = 32 + 1;
const REPLY_KEY_LENGTH: usize = 32 + 1;

// TODO ADD CHANNEL or COMMUNITY GATING
// ADD LITPROTOCOL

impl Thread {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + COMMUNITY_LENGTH // Com.
        + REPLY_KEY_LENGTH // Reply.
        + COMMUNITYTYPE_LENGTH
        + ISENCRYPTED_LENGTH // additional fields
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH // Content.
        + STRING_LENGTH_PREFIX + METADATA_LENGTH;
}

#[error]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}
