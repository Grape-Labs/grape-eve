import { useWorkspace, usePagination } from '@/composables'
import { Thread } from '@/models'
import bs58 from 'bs58'
import { BN } from '@project-serum/anchor'
import { computed, ref } from 'vue'

export const fetchThreads = async (filters = []) => {
    const { program } = useWorkspace()
    const thread = await program.value.account.thread.all(filters);
    return thread.map(thread => new Thread(thread.publicKey, thread.account))
}

export const paginateThread = (filters = [], perPage = 6, onNewPage = () => {}) => {
    filters = ref(filters)
    const { program, connection } = useWorkspace()
    const page = ref(0)

    const prefetchCb = async () => {
        // Reset page number.
        page.value = 0

        // Prepare the discriminator filter.
        const threadClient = program.value.account.thread
        const threadAccountName = threadClient._idlAccount.name
        const threadDiscriminatorFilter = {
            memcmp: threadClient.coder.accounts.memcmp(threadAccountName)
        }

        // Prefetch all thread with their timestamps only.
        const allThreads = await connection.getProgramAccounts(program.value.programId, {
            filters: [threadDiscriminatorFilter, ...filters.value],
            dataSlice: { offset: 40, length: 8 },
        })

        // Parse the timestamp from the account's data.
        const allThreadsWithTimestamps = allThreads.map(({ account, pubkey }) => ({
            pubkey,
            timestamp: new BN(account.data, 'le'),
        }))

        return allThreadsWithTimestamps
            .sort((a, b) => b.timestamp.cmp(a.timestamp))
            .map(({ pubkey }) => pubkey)
    }

    const pageCb = async (page, paginatedPublicKeys) => {
        const threads = await program.value.account.thread.fetchMultiple(paginatedPublicKeys)

        return threads.reduce((accumulator, thread, index) => {
            const publicKey = paginatedPublicKeys[index]
            accumulator.push(new Thread(publicKey, thread))
            return accumulator
        }, [])
    }

    const pagination = usePagination(perPage, prefetchCb, pageCb)
    const { hasPage, getPage } = pagination

    const hasNextPage = computed(() => hasPage(page.value + 1))
    const getNextPage = async () => {
        const newPageThreads = await getPage(page.value + 1)
        page.value += 1
        onNewPage(newPageThreads)
    }

    return { page, hasNextPage, getNextPage, ...pagination }
}

export const authorFilter = authorBase58PublicKey => ({
    memcmp: {
        offset: 8, // Discriminator.
        bytes: authorBase58PublicKey,
    }
})

export const topicFilter = topic => ({
    memcmp: {
        offset: 8 + // Discriminator.
            32 + // Author public key.
            8 + // Timestamp.
            4, // Topic string prefix.
        bytes: bs58.encode(Buffer.from(topic)),
    }
})
