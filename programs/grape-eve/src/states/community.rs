use anchor_lang::prelude::*;

#[account]
pub struct Community {
    pub bump: u8,
    pub community: Pubkey,
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub title: String,
    pub metadata: String,
}

const COMMUNITY_LENGTH: usize = 32 + 1;
const METADATA_LENGTH: usize = 280 * 4;


impl Community {
    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<u8>() + /* bump */
        std::mem::size_of::<Pubkey>() + /* community */
        std::mem::size_of::<Pubkey>() + /* mint */
        std::mem::size_of::<Pubkey>() + /* owner */
        COMMUNITY_LENGTH  + /* title */
        METADATA_LENGTH + /* metadata */
        100; /* padding */

    pub fn update(&mut self,
        bump: u8,
        community: Pubkey,
        mint: Pubkey,
        owner: Pubkey,
        title: String,
        metadata: String,
    ) {
        self.bump = bump;
        self.community = community;
        self.mint = mint;
        self.owner = owner;
        self.title = title;
        self.metadata = metadata;
    }
}