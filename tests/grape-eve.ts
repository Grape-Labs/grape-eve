import * as anchor from '@project-serum/anchor';
import {BN, IdlTypes, Program} from '@project-serum/anchor';
import { GrapeEve } from '../target/types/grape_eve';
import * as assert from "assert";
import * as bs58 from "bs58";
import {Keypair, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {airdrop, getOrCreateTokenAccountInstruction, processTransaction} from "./helpers";
import {createMint, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, mintTo} from "@solana/spl-token";
import {
    COMMUNITY_METADATA,
    COMMUNITY_TITLE,
    COMMUNITY_UUID,
    THREAD_CONTENT, THREAD_METADATA,
    THREAD_TOPIC,
    THREAD_UUID
} from "./test-fixtures";
import {getCommunity, getThread} from "./pdas";


describe('grape-eve', () => {
    // Configure the client cluster.
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.GrapeEve as Program<GrapeEve>;

    const community_owner = Keypair.generate();
    const thread_author = Keypair.generate();
    const non_thread_author = Keypair.generate();
    const non_mint_holder = Keypair.generate();
    const tokenMintAuthority = Keypair.generate();
    let mint: PublicKey;

    it("Airdrop Applicant", async () => {
        for (const i of [community_owner, thread_author, non_thread_author, non_mint_holder, tokenMintAuthority]) {
            await airdrop(program, i.publicKey, LAMPORTS_PER_SOL)
        }
    });

    it("Create mint", async () => {
        mint = await createMint(
            program.provider.connection,
            community_owner,
            tokenMintAuthority.publicKey,
            tokenMintAuthority.publicKey,
            9
        );

        for (const i of [community_owner, thread_author]) {
            const instructions = await getOrCreateTokenAccountInstruction(mint, i.publicKey, program.provider.connection)
            if (instructions === null) {
                continue;
            }
            const sig = await processTransaction([instructions], program.provider.connection, i);
            const txn = await program.provider.connection.getParsedTransaction(sig.Signature, "confirmed");
            assert.equal(sig.SignatureResult.err, null, `${mint.toBase58()}\n${txn.meta.logMessages.join("\n")}`);
        }

        await mintTo(
            program.provider.connection,
            community_owner,
            mint,
            await getAssociatedTokenAddress(mint, community_owner.publicKey),
            tokenMintAuthority,
            LAMPORTS_PER_SOL,
        );

        await mintTo(
            program.provider.connection,
            community_owner,
            mint,
            await getAssociatedTokenAddress(mint, thread_author.publicKey),
            tokenMintAuthority,
            LAMPORTS_PER_SOL,
            [],
            {
                commitment: "confirmed",
            }
        );
    })


    it("Create Community", async () => {
        const [community] = await getCommunity(COMMUNITY_UUID);

        const args: IdlTypes<GrapeEve>["CreateCommunityArgs"] = {
            title: COMMUNITY_TITLE,
            metadata: COMMUNITY_METADATA,
            uuid: COMMUNITY_UUID
        }
        
        await program.methods
            .createCommunity(args)
            .accounts({
                owner: community_owner.publicKey,
                mint: mint,
                community: community
            })
            .signers([community_owner])
            .rpc({commitment: "confirmed"});

        const communityAccount = await program.account.community.fetch(community);
        assert.equal(communityAccount.metadata, COMMUNITY_METADATA);
        assert.equal(communityAccount.title, COMMUNITY_TITLE);
        assert.equal(communityAccount.uuid, COMMUNITY_UUID);
        assert.equal(communityAccount.owner.toBase58(), community_owner.publicKey.toBase58());
        assert.equal(communityAccount.mint.toBase58(), mint.toBase58());
    });

    it("Edit Community", async () => {
        const [community] = await getCommunity(COMMUNITY_UUID);
        const communityAccountBefore = await program.account.community.fetch(community);
        assert.equal(communityAccountBefore.metadata, COMMUNITY_METADATA);
        assert.equal(communityAccountBefore.title, COMMUNITY_TITLE);
        assert.equal(communityAccountBefore.uuid, COMMUNITY_UUID);
        assert.equal(communityAccountBefore.owner.toBase58(), community_owner.publicKey.toBase58());
        assert.equal(communityAccountBefore.mint.toBase58(), mint.toBase58());

        const args: IdlTypes<GrapeEve>["EditCommunityArgs"] = {
            title: COMMUNITY_TITLE + "1",
            metadata: COMMUNITY_METADATA + "1",
        }

        await program.methods
            .editCommunity(args)
            .accounts({
                owner: community_owner.publicKey,
                mint: mint,
                community: community
            })
            .signers([community_owner])
            .rpc({commitment: "confirmed"});


        const communityAccountAfter= await program.account.community.fetch(community);
        assert.equal(communityAccountAfter.metadata, COMMUNITY_METADATA + "1");
        assert.equal(communityAccountAfter.title, COMMUNITY_TITLE + "1");
        assert.equal(communityAccountAfter.uuid, COMMUNITY_UUID);
        assert.equal(communityAccountAfter.owner.toBase58(), community_owner.publicKey.toBase58());
        assert.equal(communityAccountAfter.mint.toBase58(), mint.toBase58());
    });


    it("Create Thread - user with token", async () => {
        const [thread] = await getThread(THREAD_UUID);
        const [community] = await getCommunity(COMMUNITY_UUID);
        const author_token_account = await getAssociatedTokenAddress(mint, thread_author.publicKey);

        const args: IdlTypes<GrapeEve>["CreateThreadArgs"] = {
            replyTo: thread.toBase58(),
            threadType: 0,
            isEncrypted: false,
            topic: THREAD_TOPIC,
            content: THREAD_CONTENT,
            metadata: THREAD_METADATA,
            uuid: THREAD_UUID,
            ends: new BN(0),
        };

        await program.methods
            .createThread(args)
            .accounts({
                author: thread_author.publicKey,
                mint: mint,
                community: community,
                authorTokenAccount: author_token_account,
                thread: thread
            })
            .signers([thread_author])
            .rpc({commitment: "confirmed"});

        const threadAccount = await program.account.thread.fetch(thread);
        assert.equal(threadAccount.metadata, THREAD_METADATA);
        assert.equal(threadAccount.topic, THREAD_TOPIC);
        assert.equal(threadAccount.content, THREAD_CONTENT);
        assert.equal(threadAccount.uuid, THREAD_UUID);
        assert.equal(threadAccount.author.toBase58(), thread_author.publicKey.toBase58());
        assert.equal(threadAccount.community.toBase58(), community.toBase58());
        assert.equal(threadAccount.reply.toBase58(), thread.toBase58());
    });

    /*
    it('checking length', async () => {
        //const threads = program.account.thread.fetch()

        const threads = program.account.thread.all([]);
        //const mptrd = thread.map((thread:any) => new Thread(thread.publicKey, thread.account))
        //console.log("threads:" + JSON.stringify(program.account.thread.all([])))
        for (var thread of threads){
            await program.rpc.deletePost({
                accounts: {
                    thread: thread.publicKey,
                    author: thread.author,
                },
            });
        }
    });

    it('can make a new thread', async () => {
        // Call the "SendPost" instruction.
        const thread = anchor.web3.Keypair.generate();
        await program.rpc.sendPost('other', 'Testing posting from within', '', '', '', null, null, {
            accounts: {
                thread: thread.publicKey,
                author: program.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [thread],
        });

        // Fetch the account details of the created thread.
        const threadAccount = await program.account.thread.fetch(thread.publicKey);

        // Ensure it has the right data.
        assert.equal(threadAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
        assert.equal(threadAccount.topic, 'other');
        assert.equal(threadAccount.content, 'Testing posting from within');
        assert.ok(threadAccount.timestamp);
    });

    it('can send a new thread without a topic', async () => {
        // Call the "SendPost" instruction.
        const thread = anchor.web3.Keypair.generate();
        await program.rpc.sendPost('', 'gm', {
            accounts: {
                thread: thread.publicKey,
                author: program.provider.wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [thread],
        });

        // Fetch the account details of the created thread.
        const threadAccount = await program.account.thread.fetch(thread.publicKey);

        // Ensure it has the right data.
        assert.equal(threadAccount.author.toBase58(), program.provider.wallet.publicKey.toBase58());
        assert.equal(threadAccount.topic, '');
        assert.equal(threadAccount.content, 'gm');
        assert.ok(threadAccount.timestamp);
    });

    it('can send a new thread from a different author', async () => {
        // Generate another user and airdrop them some SOL.
        const otherUser = anchor.web3.Keypair.generate();
        const signature = await program.provider.connection.requestAirdrop(otherUser.publicKey, 1000000000);
        await program.provider.connection.confirmTransaction(signature);

        // Call the "SendPost" instruction on behalf of this other user.
        const thread = anchor.web3.Keypair.generate();
        await program.rpc.sendPost('fruit', 'Yay its Grape!', {
            accounts: {
                thread: thread.publicKey,
                author: otherUser.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [otherUser, thread],
        });

        // Fetch the account details of the created thread.
        const threadAccount = await program.account.thread.fetch(thread.publicKey);

        // Ensure it has the right data.
        assert.equal(threadAccount.author.toBase58(), otherUser.publicKey.toBase58());
        assert.equal(threadAccount.topic, 'fruit');
        assert.equal(threadAccount.content, 'Yay its Grape!');
        assert.ok(threadAccount.timestamp);
    });

    it('cannot provide a topic with more than 50 characters', async () => {
        try {
            const thread = anchor.web3.Keypair.generate();
            const topicWith51Chars = 'x'.repeat(51);
            await program.rpc.sendPost(topicWith51Chars, 'Something purple, am I right?', {
                accounts: {
                    thread: thread.publicKey,
                    author: program.provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
                signers: [thread],
            });
        } catch (error) {
            assert.equal(error.msg, 'The provided topic should be 50 characters long maximum.');
            return;
        }

        assert.fail('The instruction should have failed with a 51-character topic.');
    });

    it('cannot provide a content with more than 280 characters', async () => {
        try {
            const thread = anchor.web3.Keypair.generate();
            const contentWith281Chars = 'x'.repeat(281);
            await program.rpc.sendPost('veganism', contentWith281Chars, {
                accounts: {
                    thread: thread.publicKey,
                    author: program.provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
                signers: [thread],
            });
        } catch (error) {
            assert.equal(error.msg, 'The provided content should be 280 characters long maximum.');
            return;
        }

        assert.fail('The instruction should have failed with a 281-character content.');
    });

    it('can fetch all thread', async () => {
        const threadAccounts = await program.account.thread.all();
        assert.equal(threadAccounts.length, 3);
    });

    it('can filter threads by author', async () => {
        const authorPublicKey = program.provider.wallet.publicKey
        const threadAccounts = await program.account.thread.all([
            {
                memcmp: {
                    offset: 8, // Discriminator.
                    bytes: authorPublicKey.toBase58(),
                }
            }
        ]);

        assert.equal(threadAccounts.length, 2);
        assert.ok(threadAccounts.every(threadAccount => {
            return threadAccount.account.author.toBase58() === authorPublicKey.toBase58()
        }))
    });

    it('can filter threads by topics', async () => {
        const threadAccounts = await program.account.thread.all([
            {
                memcmp: {
                    offset: 8 + // Discriminator.
                        32 + // Author public key.
                        8 + // Timestamp.
                        4, // Topic string prefix.
                    bytes: bs58.encode(Buffer.from('fruit')),
                }
            }
        ]);

        assert.equal(threadAccounts.length, 2);
        assert.ok(threadAccounts.every(threadAccount => {
            return threadAccount.account.topic === 'fruit'
        }))
    });

    it('can update a thread', async () => {
        // Send a thread and fetch its account.
        const author = program.provider.wallet.publicKey;
        const thread = await SendPost(author, 'web2', 'Hello World!');
        const threadAccount = await program.account.thread.fetch(thread.publicKey);

        // Ensure it has the right data.
        assert.equal(threadAccount.topic, 'web2');
        assert.equal(threadAccount.content, 'Hello World!');

        // Update the Thread.
        await program.rpc.updatePost('solana', 'gm everyone!', {
            accounts: {
                thread: thread.publicKey,
                author,
            },
        });

        // Ensure the updated thread has the updated data.
        const updatedThreadAccount = await program.account.thread.fetch(thread.publicKey);
        assert.equal(updatedThreadAccount.topic, 'solana');
        assert.equal(updatedThreadAccount.content, 'gm everyone!');
    });

    it('cannot update someone else\'s thread', async () => {
        // Send a thread.
        const author = program.provider.wallet.publicKey;
        const thread = await SendPost(author, 'solana', 'Solana is awesome!');

        // Update the thread.
        try {
            await program.rpc.updatePost('eth', 'Ethereum is awesome!', {
                accounts: {
                    thread: thread.publicKey,
                    author: anchor.web3.Keypair.generate().publicKey,
                },
            });
            assert.fail('We were able to update someone else\'s thread.');
        } catch (error) {
            // Ensure the thread account kept the initial data.
            const threadAccount = await program.account.thread.fetch(thread.publicKey);
            assert.equal(threadAccount.topic, 'solana');
            assert.equal(threadAccount.content, 'Solana is awesome!');
        }
    });

    it('can delete a thread', async () => {
        // Create a new thread.
        const author = program.provider.wallet.publicKey;
        const thread = await SendPost(author, 'solana', 'gm');

        // Delete the thread.
        await program.rpc.deletePost({
            accounts: {
                thread: thread.publicKey,
                author,
            },
        });

        // Ensure fetching the thread account returns null.
        const threadAccount = await program.account.thread.fetchNullable(thread.publicKey);
        assert.ok(threadAccount === null);
    });

    it('cannot delete someone else\'s thread', async () => {
        // Create a new thread.
        const author = program.provider.wallet.publicKey;
        const thread = await SendPost(author, 'solana', 'gm');

        // Try to delete the thread from a different author.
        try {
            await program.rpc.deletePost({
                accounts: {
                    thread: thread.publicKey,
                    author: anchor.web3.Keypair.generate().publicKey,
                },
            });
            assert.fail('We were able to delete someone else\'s thread.');
        } catch (error) {
            // Ensure the thread account still exists with the right data.
            const threadAccount = await program.account.thread.fetch(thread.publicKey);
            assert.equal(threadAccount.topic, 'solana');
            assert.equal(threadAccount.content, 'gm');
        }
    });
    */
});
