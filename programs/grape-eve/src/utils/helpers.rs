#![allow(dead_code)]
#![allow(unused_variables)]
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_memory::sol_memset;
use crate::error_codes::errors::Errors;

pub fn transfer_sol(from: &mut AccountInfo, to: &mut AccountInfo, amount: u64) -> Result<()> {
    let post_from = from
        .lamports()
        .checked_sub(amount)
        .ok_or(Errors::NumericalOverflow)?;
    let post_to = to
        .lamports()
        .checked_add(amount)
        .ok_or(Errors::NumericalOverflow)?;

    **from.try_borrow_mut_lamports().unwrap() = post_from;
    **to.try_borrow_mut_lamports().unwrap() = post_to;
    Ok(())
}

pub fn close_account(from: &mut AccountInfo, to: &mut AccountInfo) -> Result<()> {
    let amount = from.lamports();
    let size = from.try_data_len()?;
    transfer_sol(from, to, amount)?;
    sol_memset(&mut **from.try_borrow_mut_data()?, 0, size);
    Ok(())
}

pub fn is_native(token_mint: &AccountInfo) -> bool {
    token_mint.key() == spl_token::native_mint::id()
}

pub fn transfer_token<'a>(
    from: &'a AccountInfo<'a>,
    to: &'a AccountInfo<'a>,
    token_program: &'a AccountInfo<'a>,
    owner: &'a AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    anchor_lang::solana_program::program::invoke(
        &spl_token::instruction::transfer(
            &token_program.key(),
            &from.key(),
            &to.key(),
            &owner.key(),
            &[],
            amount,
        )?,
        &[
            from.clone(),
            to.clone(),
            token_program.clone(),
            owner.clone(),
        ],
    )?;
    Ok(())
}