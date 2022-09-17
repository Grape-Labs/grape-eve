use anchor_lang::prelude::*;

pub const COMMUNITY: &str = "COMMUNITY";

#[account]
pub struct Community {
    pub bump: u8,
    pub uuid: String,
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub title: String,
    pub metadata: String,
}

const COMMUNITY_LENGTH: usize = 32 + 1;
const METADATA_LENGTH: usize = 100 * 4;
const UUID_LENGTH: usize = 16;

impl Community {
    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<u8>() + /* bump */
        UUID_LENGTH + /* uuid */
        std::mem::size_of::<Pubkey>() + /* mint */
        std::mem::size_of::<Pubkey>() + /* owner */
        COMMUNITY_LENGTH  + /* title */
        METADATA_LENGTH + /* metadata */
        100; /* padding */

    pub fn update(
        &mut self,
        bump: u8,
        uuid: String,
        mint: Pubkey,
        owner: Pubkey,
        title: String,
        metadata: String,
    ) {
        self.bump = bump;
        self.uuid = uuid;
        self.mint = mint;
        self.owner = owner;
        self.title = title;
        self.metadata = metadata;
    }
}
