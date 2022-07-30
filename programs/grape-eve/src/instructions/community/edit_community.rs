use crate::states::community::Community;
use crate::states::community::COMMUNITY;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct EditCommunityArgs {
    pub title: String,
    pub metadata: String,
}

#[derive(Accounts)]
#[instruction(args: EditCommunityArgs)]
pub struct EditCommunityContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
    mut,
    seeds=[COMMUNITY.as_bytes(), community.uuid.as_bytes()],
    bump=community.bump,
    )]
    pub community: Account<'info, Community>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn edit_community(ctx: Context<EditCommunityContext>, args: EditCommunityArgs) -> Result<()> {
    let community = &mut ctx.accounts.community;
    let bump = community.bump;
    let uuid = community.uuid.clone();

    community.update(
        bump,
        uuid,
        ctx.accounts.mint.key(),
        ctx.accounts.owner.key(),
        args.title,
        args.metadata,
    );

    Ok(())
}
