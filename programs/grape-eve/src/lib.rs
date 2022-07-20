use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

declare_id!("BNDCEb5uXCuWDxJW9BGmbfvR1JBMAKckfhYrEKW2Bv1W");

#[program]
pub mod grape_eve {
    use super::*;
    pub fn send_post(ctx: Context<SendPost>, topic: String, content: String) -> ProgramResult {
        let dweet: &mut Account<Dweet> = &mut ctx.accounts.dweet;
        let author: &Signer = &ctx.accounts.author;
        let clock: Clock = Clock::get().unwrap();

        if topic.chars().count() > 50 {
            return Err(ErrorCode::TopicTooLong.into())
        }

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }

        dweet.author = *author.key;
        dweet.timestamp = clock.unix_timestamp;
        dweet.topic = topic;
        dweet.content = content;
        //dweet.community = community;
        //dweet.communityType = community_type;
        //dweet.metadata = metadata;
        //dweet.isEncrypted = is_encrypted;

        Ok(())
    }

    pub fn update_post(ctx: Context<UpdatePost>, topic: String, content: String) -> ProgramResult {
        let dweet: &mut Account<Dweet> = &mut ctx.accounts.dweet;

        if topic.chars().count() > 50 {
            return Err(ErrorCode::TopicTooLong.into())
        }

        if content.chars().count() > 280 {
            return Err(ErrorCode::ContentTooLong.into())
        }

        dweet.topic = topic;
        dweet.content = content;

        Ok(())
    }

    pub fn delete_post(_ctx: Context<DeletePost>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SendPost<'info> {
    #[account(init, payer = author, space = Dweet::LEN)]
    pub dweet: Account<'info, Dweet>,
    #[account(mut)]
    pub author: Signer<'info>,
    #[account(address = system_program::ID)]
    //pub system_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePost<'info> {
    #[account(mut, has_one = author)]
    pub dweet: Account<'info, Dweet>,
    pub author: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeletePost<'info> {
    #[account(mut, has_one = author, close = author)]
    pub dweet: Account<'info, Dweet>,
    pub author: Signer<'info>,
}

#[account]
pub struct Dweet {
    pub author: Pubkey,
    pub timestamp: i64,
    pub topic: String,
    pub content: String,
    pub community: Pubkey,
    pub community_type: i64,
    pub metadata: String,
    pub is_encrypted: bool
}

const DISCRIMINATOR_LENGTH: usize = 8;
const PUBLIC_KEY_LENGTH: usize = 32;
const TIMESTAMP_LENGTH: usize = 8;
const STRING_LENGTH_PREFIX: usize = 4; // Stores the size of the string.
const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max.
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max.
const COMMUNITYTYPE_LENGTH: usize = 1;
const METADATA_LENGTH: usize = 100;
const ISENCRYPTED_LENGTH: usize = 1;

// TODO ADD CHANNEL or COMMUNITY GATING
// ADD LITPROTOCOL

impl Dweet {
    const LEN: usize = DISCRIMINATOR_LENGTH
        + PUBLIC_KEY_LENGTH // Author.
        + TIMESTAMP_LENGTH // Timestamp.
        + STRING_LENGTH_PREFIX + MAX_TOPIC_LENGTH // Topic.
        + STRING_LENGTH_PREFIX + MAX_CONTENT_LENGTH // Content.
        + STRING_LENGTH_PREFIX + COMMUNITYTYPE_LENGTH 
        + STRING_LENGTH_PREFIX + METADATA_LENGTH 
        + ISENCRYPTED_LENGTH; // additional fields
}

#[error]
pub enum ErrorCode {
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
}
