import { useWorkspace } from '@/composables'

export const deletePost = async (tweet) => {
    const { wallet, program } = useWorkspace()
    await program.value.rpc.deletePost({
        accounts: {
            author: wallet.value.publicKey,
            tweet: tweet.publicKey,
        },
    })
}
