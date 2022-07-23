import { useWorkspace } from '@/composables'
import { Thread } from '@/models'

export const getThread = async (publicKey) => {
    const { program } = useWorkspace()
    const account = await program.value.account.thread.fetch(publicKey);
    return new Thread(publicKey, account)
}
