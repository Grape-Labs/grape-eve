import { useWorkspace } from '@/composables'

export const DeletePost = async (thread) => {
    const { wallet, program } = useWorkspace()
    await program.value.rpc.DeletePost({
        accounts: {
            author: wallet.value.publicKey,
            thread: thread.publicKey,
        },
    })
}
