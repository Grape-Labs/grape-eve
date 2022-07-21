import { useWorkspace } from '@/composables'

export const UpdatePost = async (thread, topic, content) => {
    const { wallet, program } = useWorkspace()
    await program.value.rpc.updatePost(topic, content, {
        accounts: {
            author: wallet.value.publicKey,
            thread: thread.publicKey,
        },
    })

    thread.topic = topic
    thread.content = content
}
