import {
    Connection,
    Keypair,
    Transaction,
    TransactionInstruction,
    SignatureResult,
    PublicKey,
    BlockheightBasedTransactionConfirmationStrategy,
    Blockhash
} from "@solana/web3.js";
import {Program} from "@project-serum/anchor";
import {createAssociatedTokenAccountInstruction, getAssociatedTokenAddress} from "@solana/spl-token";

export declare type TxnResult = {
    Signature: string;
    SignatureResult: SignatureResult;
};

export async function processTransaction(
    instructions: TransactionInstruction[],
    connection: Connection,
    payer: Keypair
): Promise<TxnResult> {
    const tx = new Transaction();
    instructions.map((i) => tx.add(i));
    const blockStats = await connection.getLatestBlockhash();
    tx.recentBlockhash = blockStats.blockhash;
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    const sig = await connection.sendRawTransaction(tx.serialize(), {
        maxRetries: 3,
        preflightCommitment: "confirmed",
        skipPreflight: true,
    });
    const strategy: BlockheightBasedTransactionConfirmationStrategy = {
        signature: sig,
        blockhash: blockStats.blockhash,
        lastValidBlockHeight: blockStats.lastValidBlockHeight
    }
    const result = await connection.confirmTransaction(strategy, "confirmed");
    return {
        Signature: sig,
        SignatureResult: result.value,
    };
}

export async function airdrop(program: Program<any>, receiver: PublicKey, amount: number) {
    const sig = await program.provider.connection.requestAirdrop(receiver, amount);
    const blockStats = await program.provider.connection.getLatestBlockhash();
    const strategy: BlockheightBasedTransactionConfirmationStrategy = {
        signature: sig,
        blockhash: blockStats.blockhash,
        lastValidBlockHeight: blockStats.lastValidBlockHeight
    }
    await program.provider.connection.confirmTransaction(strategy, "confirmed");
}

export async function getTxn(program: Program<any>, signature: string) {
    const blockStats = await program.provider.connection.getLatestBlockhash();
    const strategy: BlockheightBasedTransactionConfirmationStrategy = {
        signature: signature,
        blockhash: blockStats.blockhash,
        lastValidBlockHeight: blockStats.lastValidBlockHeight
    }
    await program.provider.connection.confirmTransaction(strategy, "confirmed");
    return await program.provider.connection.getParsedTransaction(signature, "confirmed");
}


export async function getOrCreateTokenAccountInstruction(mint: PublicKey, user: PublicKey, connection: Connection, payer: PublicKey|null = null): Promise<TransactionInstruction | null> {
    const userTokenAccountAddress = await getAssociatedTokenAddress(mint, user, false);
    const userTokenAccount = await connection.getParsedAccountInfo(userTokenAccountAddress);
    if (userTokenAccount.value === null) {
        return createAssociatedTokenAccountInstruction(payer ? payer : user, userTokenAccountAddress, user, mint);
    } else {
        return null;
    }
}