use anchor_lang::prelude::*;

#[error_code]
pub enum Errors {
    #[msg("PublicKey Mismatch")]
    PublicKeyMismatch,
    #[msg("Incorrect Owner")]
    IncorrectOwner,
    #[msg("Uninitialized Account")]
    UninitializedAccount,
    #[msg("Numerical Overflow")]
    NumericalOverflow,
    #[msg("Unsure Error")]
    UnsureError,
    #[msg("The provided topic should be 50 characters long maximum.")]
    TopicTooLong,
    #[msg("The provided content should be 280 characters long maximum.")]
    ContentTooLong,
    #[msg("You don't hold the needed mint token")]
    NotEnoughBalance,
    #[msg("Invalid PubKey provided")]
    InvalidPubkeyProvided
}
