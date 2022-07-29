use anchor_lang::prelude::*;

#[account]
pub struct Thread {
    pub bump: u8,
    pub author: Pubkey,
    pub timestamp: u64,
    pub community: Option<Pubkey>,
    pub reply: Option<Pubkey>,
    pub thread_type: u8,
    pub is_encrypted: bool,
    pub topic: String,
    pub content: String,
    pub metadata: String,
}

const MAX_TOPIC_LENGTH: usize = 50 * 4; // 50 chars max.
const MAX_CONTENT_LENGTH: usize = 280 * 4; // 280 chars max.
const METADATA_LENGTH: usize = 280 * 4;

impl Thread {
    pub const SIZE: usize = 8 + /* discriminator */
        std::mem::size_of::<u8>() + /* bump */
        std::mem::size_of::<Pubkey>() + /* author */
        std::mem::size_of::<u64>() + /* timestamp */
        std::mem::size_of::<Pubkey>() + /* community */
        std::mem::size_of::<Pubkey>() + /* reply */
        std::mem::size_of::<u8>() + /* thread_type */
        std::mem::size_of::<bool>() + /* is_encrypted */
        MAX_TOPIC_LENGTH + /* topic */
        MAX_CONTENT_LENGTH + /* content */
        METADATA_LENGTH +  /* metadata */
        100 /* padding */
    ;

    pub fn update(&mut self,
                  bump: u8,
                  author: Pubkey,
                  timestamp: u64,
                  community: Option<Pubkey>,
                  reply: Option<Pubkey>,
                  thread_type: u8,
                  is_encrypted: bool,
                  topic: String,
                  content: String,
                  metadata: String,
    ) {
        self.bump = bump;
        self.author = author;
        self.timestamp = timestamp;
        self.community = community;
        self.reply = reply;
        self.thread_type = thread_type;
        self.is_encrypted = is_encrypted;
        self.topic = topic;
        self.content = content;
        self.metadata = metadata;
    }
}

