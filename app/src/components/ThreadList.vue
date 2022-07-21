<script setup>
import { computed, toRefs } from 'vue'
import ThreadCard from '@/components/ThreadCard'

const emit = defineEmits(['update:threads', 'more'])
const props = defineProps({
    threads: Array,
    loading: Boolean,
    hasMore: Boolean,
})

const { threads, loading, hasMore } = toRefs(props)
const orderedThreads = computed(() => {
    return threads.value.slice().sort((a, b) => b.timestamp - a.timestamp)
})

const onDelete = deletedThread => {
    const filteredThreads = threads.value.filter(thread => thread.publicKey.toBase58() !== deletedThread.publicKey.toBase58())
    emit('update:threads', filteredThreads)
}
</script>

<template>
    <div class="divide-y">
        <thread-card v-for="thread in orderedThreads" :key="thread.key" :thread="thread" @delete="onDelete"></thread-card>
        <div v-if="loading" class="p-8 text-gray-500 text-center">
            Loading...
        </div>
        <div v-else-if="hasMore" class="p-8 text-center">
            <button @click="emit('more')" class="px-4 py-2 rounded-full border bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900">
                Load more
            </button>
        </div>
    </div>
</template>
