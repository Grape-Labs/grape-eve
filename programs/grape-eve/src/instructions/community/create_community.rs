use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCommunityArgs {
    pub are_you_sure: bool
}

#[derive(Accounts)]
#[instruction(args: CreateCommunityArgs)]
pub struct CreateCommunityContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn create_community(
    ctx: Context<CreateCommunityContext>,
    args: CreateCommunityArgs,
) -> Result<()> {
    Ok(())
}
