<script setup>
import { ref, watchEffect } from 'vue'
import { PublicKey } from '@solana/web3.js'
import { getThread } from '@/api'
import { useFromRoute } from '@/composables'
import ThreadCard from '@/components/ThreadCard'

const threadAddress = ref(null)
useFromRoute((route) => threadAddress.value = route.params.thread)

const loading = ref(false)
const thread = ref(null)
watchEffect(async () => {
    try {
        loading.value = true
        thread.value = await getThread(new PublicKey(threadAddress.value))
    } catch (e) {
        thread.value = null
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div v-if="loading" class="p-8 text-gray-500 text-center">
        Loading...
    </div>
    <div v-else-if="! thread" class="p-8 text-gray-500 text-center">
        Thread not found
    </div>
    <thread-card v-else :thread="thread" @delete="$router.push({ name: 'Home' })"></thread-card>
</template>
