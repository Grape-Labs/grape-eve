use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct EditCommunityArgs {
    pub are_you_sure: bool
}

#[derive(Accounts)]
#[instruction(args: EditCommunityArgs)]
pub struct EditCommunityContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn edit_community(
    ctx: Context<EditCommunityContext>,
    args: EditCommunityArgs,
) -> Result<()> {
    Ok(())
}
