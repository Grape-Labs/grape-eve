<script setup>
import { ref, watchEffect } from 'vue'
import { paginateThreads, authorFilter } from '@/api'
import ThreadForm from '@/components/ThreadForm'
import ThreadList from '@/components/ThreadList'
import { useWorkspace } from '@/composables'

const threads = ref([])
const { wallet } = useWorkspace()
const filters = ref([])

const onNewPage = newThreads => threads.value.push(...newThreads)
const { prefetch, hasNextPage, getNextPage, loading } = paginateThreads(filters, 10, onNewPage)

watchEffect(() => {
    if (! wallet.value) return
    threads.value = []
    filters.value = [authorFilter(wallet.value.publicKey.toBase58())]
    prefetch().then(getNextPage)
})

const addThread = thread => threads.value.push(thread)
</script>

<template>
    <div v-if="wallet" class="border-b px-8 py-4 bg-gray-50 break-all">
        {{ wallet.publicKey.toBase58() }}
    </div>
    <thread-form @added="addThread"></thread-form>
    <thread-list v-model:threads="threads" :loading="loading" :has-more="hasNextPage" @more="getNextPage"></thread-list>
</template>
