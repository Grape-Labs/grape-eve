use anchor_lang::prelude::*;
use crate::error_codes::errors::Errors;
use crate::states::thread::Thread;


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

pub fn update_post(ctx: Context<UpdatePost>, topic: String, content: String) -> Result<()> {
    let thread: &mut Account<Thread> = &mut ctx.accounts.thread;

    if topic.chars().count() > 50 {
        return Err(Errors::TopicTooLong.into())
    }

    if content.chars().count() > 280 {
        return Err(Errors::ContentTooLong.into())
    }

    thread.topic = topic;
    thread.content = content;

    Ok(())
}