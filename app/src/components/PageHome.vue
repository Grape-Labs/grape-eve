<script setup>
import { ref } from 'vue'
import { paginateThreads } from '@/api'
import ThreadForm from '@/components/ThreadForm'
import ThreadList from '@/components/ThreadList'

const threads = ref([])
const onNewPage = newThreads => threads.value.push(...newThreads)
const { prefetch, hasNextPage, getNextPage, loading } = paginateThreads([], 10, onNewPage)
prefetch().then(getNextPage)

const addThread = thread => threads.value.push(thread)
</script>

<template>
    <thread-form @added="addThread"></thread-form>
    <thread-list v-model:threads="threads" :loading="loading" :has-more="hasNextPage" @more="getNextPage"></thread-list>
</template>
