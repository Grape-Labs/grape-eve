import { useWorkspace } from '@/composables'

export const updatePost = async (tweet, topic, content) => {
    const { wallet, program } = useWorkspace()
    await program.value.rpc.updatePost(topic, content, {
        accounts: {
            author: wallet.value.publicKey,
            tweet: tweet.publicKey,
        },
    })

    tweet.topic = topic
    tweet.content = content
}
