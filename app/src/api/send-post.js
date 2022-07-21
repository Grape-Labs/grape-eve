import { web3 } from '@project-serum/anchor'
import { useWorkspace } from '@/composables'
import { Thread } from '@/models'

export const SendPost = async (topic, content) => {
    const { wallet, program } = useWorkspace()
    const thread = web3.Keypair.generate()

    await program.value.rpc.sendPost(topic, content, {
        accounts: {
            author: wallet.value.publicKey,
            thread: thread.publicKey,
            systemProgram: web3.SystemProgram.programId,
        },
        signers: [thread]
    })

    const threadAccount = await program.value.account.thread.fetch(thread.publicKey)
    return new Thread(thread.publicKey, threadAccount)
}
