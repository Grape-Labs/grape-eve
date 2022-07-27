import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { GrapeEve } from '../target/types/grape_eve';
import * as assert from "assert";
import * as bs58 from "bs58";

describe('grape-eve', () => {
    // Configure the client cluster.
    anchor.setProvider(anchor.Provider.env());
    const program = anchor.workspace.GrapeEve as Program<GrapeEve>;

    //console.log("here: "+program.account.thread.all(null))

    const SendPost = async (author, topic, content, community_type, is_encrypted, metadata, community, reply) => {
        const thread = anchor.web3.Keypair.generate();
        await program.rpc.sendPost(topic, content, {
            accounts: {
                thread: thread.publicKey,
                author,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [thread],
        });

        return thread
    }

    

    it('can make a new thread', async () => {
        // Call the "SendPost" instruction.
        const thread = anchor.web3.Keypair.generate();
        await program.rpc.sendPost('fruit', 'Grape, how does that sound?', '', '', '', '', '', {
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
        assert.equal(threadAccount.topic, 'fruit');
        assert.equal(threadAccount.content, 'Grape, how does that sound?');
        assert.ok(threadAccount.timestamp);
    });

    /*
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
