import { useWorkspace } from '@/composables'

export const DeletePost = async (tweet) => {
    const { wallet, program } = useWorkspace()
    await program.value.rpc.DeletePost({
        accounts: {
            author: wallet.value.publicKey,
            tweet: tweet.publicKey,
        },
    })
}
