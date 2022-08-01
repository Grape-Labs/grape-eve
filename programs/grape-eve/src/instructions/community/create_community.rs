use crate::states::community::Community;
use crate::states::community::COMMUNITY;
use anchor_lang::prelude::*;
use anchor_spl::token::Mint;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateCommunityArgs {
    pub title: String,
    pub metadata: String,
    pub uuid: String,
}

#[derive(Accounts)]
#[instruction(args: CreateCommunityArgs)]
pub struct CreateCommunityContext<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub mint: Box<Account<'info, Mint>>,
    #[account(
        init,
        seeds=[COMMUNITY.as_bytes(), args.uuid.as_bytes()],
        payer=owner,
        space=Community::SIZE,
        bump
    )]
    pub community: Account<'info, Community>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_community(
    ctx: Context<CreateCommunityContext>,
    args: CreateCommunityArgs,
) -> Result<()> {
    let community = &mut ctx.accounts.community;

    community.update(
        *ctx.bumps.get("community").unwrap(),
        args.uuid,
        ctx.accounts.mint.key(),
        ctx.accounts.owner.key(),
        args.title,
        args.metadata,
    );

    Ok(())
}
