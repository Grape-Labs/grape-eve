use anchor_lang::prelude::*;
use crate::states::thread::Thread;


#[derive(Accounts)]
pub struct DeletePost<'info> {
    #[account(mut, has_one = author, close = author)]
    pub thread: Account<'info, Thread>,
    pub author: Signer<'info>,
}

pub fn delete_post(_ctx: Context<DeletePost>) -> Result<()> {
    Ok(())
}
