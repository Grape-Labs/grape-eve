import * as anchor from "@project-serum/anchor";
import {Connection, PublicKey, TransactionInstruction} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("evebL3R4wYwkYETcMfNEjgu1zDQ5VyXgJQF1pyAmzaL")
export const THREAD: string = "THREAD";
export const COMMUNITY: string = "COMMUNITY";


export async function getThread(uuid: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
        Buffer.from(anchor.utils.bytes.utf8.encode(THREAD)),
        Buffer.from(anchor.utils.bytes.utf8.encode(uuid)),
    ], PROGRAM_ID);
}

export async function getCommunity(uuid: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress([
        Buffer.from(anchor.utils.bytes.utf8.encode(COMMUNITY)),
        Buffer.from(anchor.utils.bytes.utf8.encode(uuid)),
    ], PROGRAM_ID);
}