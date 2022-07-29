use anchor_lang::prelude::*;
use crate::states::thread::Thread;
use crate::error_codes::errors::Errors;


#[derive(Accounts)]
pub struct SendPost<'info> {
    #[account(init, payer = author, space = Thread::SIZE)]
    pub thread: Account<'info, Thread>,
    #[account(mut)]
    pub author: Signer<'info>,
    // #[account(address = system_program::ID)]

    //#[account(init, payer = author, space = Thread::LEN)]
    //pub community: Signer<'info>,
    // TODO ADD CHANNEL or COMMUNITY GATING
    // ADD LITPROTOCOL

    /*
        let rpc_url = String::from("https://api.devnet.solana.com");
        let connection = RpcClient::new_with_commitment(rpc_url, CommitmentConfig::confirmed());

        let token_account = Pubkey::from_str("FWZedVtyKQtP4CXhT7XDnLidRADrJknmZGA2qNjpTPg8").unwrap();
        let balance = connection
            .get_token_account_balance(&token_account)
            .unwrap();

        println!("amount: {}, decimals: {}", balance.amount, balance.decimals);
        */

    /*
    let mint = Mint::unpack_unchecked(&mint_account.data).unwrap();
    assert_eq!(mint.supply, 2000 - 42);
    let account = Account::unpack_unchecked(&account_account.data).unwrap();
    assert_eq!(account.amount, 1000 - 42);


    // insufficient funds
    assert_eq!(

    );
    */

    //pub system_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

pub fn send_post(ctx: Context<SendPost>, topic: String, content: String, metadata: String, thread_type: u8, is_encrypted: bool, community: Option<Pubkey>, reply: Option<Pubkey>) -> Result<()> {
    let thread: &mut Account<Thread> = &mut ctx.accounts.thread;
    let author: &Signer = &ctx.accounts.author;
    let clock: Clock = Clock::get().unwrap();

    if topic.chars().count() > 50 {
        return Err(Errors::TopicTooLong.into())
    }

    if content.chars().count() > 280 {
        return Err(Errors::ContentTooLong.into())
    }

    thread.author = *author.key;
    thread.timestamp = clock.unix_timestamp as u64;
    thread.topic = topic;
    thread.content = content;
    thread.metadata = metadata;
    thread.thread_type = thread_type;
    thread.is_encrypted = is_encrypted;
    thread.community = community;
    thread.reply = reply;

    Ok(())
}