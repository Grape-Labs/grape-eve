import { useWorkspace } from '@/composables'

export const UpdatePost = async (tweet, topic, content) => {
    const { wallet, program } = useWorkspace()
    await program.value.rpc.UpdatePost(topic, content, {
        accounts: {
            author: wallet.value.publicKey,
            tweet: tweet.publicKey,
        },
    })

    tweet.topic = topic
    tweet.content = content
}
