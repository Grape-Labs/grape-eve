use crate::states::community::Community;
use anchor_lang::prelude::*;
//use anchor_lang::AccountsClose;

#[derive(Accounts)]
pub struct DeleteCommunity<'info> {
    //#[account(mut, has_one = author, close = author)]
    #[account(mut)]
    pub community: Account<'info, Community>,
    pub author: Signer<'info>,
}

pub fn delete_community(_ctx: Context<DeleteCommunity>) -> Result<()> {
    //let author = &ctx.accounts.author;
    //community.close(author.to_account_info())?;
    Ok(())
}
