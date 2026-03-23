<script setup lang="ts">
import { eventApi } from '@/services/event-api'
import { onMounted, ref } from 'vue'
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'

const emit = defineEmits<{
  (e: 'selectOption', data: Option): void
}>()
const eventList = ref<Option[]>([])

onMounted(() => {
  getEventList()
})

function selectEvent(data: Option) {
  emit('selectOption', data)
}

async function getEventList() {
  const eventsAllRes = await eventApi.getEventsAll()
  if (eventsAllRes.length !== 0) {
    eventList.value = eventsAllRes.map((res) => ({
      name: res.name,
      value: res.id.toString(),
    }))
  }
}
</script>

<template>
  <SelectComponent
    label="場次"
    :defaultValue="{ name: '', value: '' }"
    :optionList="eventList"
    @selectOption="selectEvent"
  ></SelectComponent>
</template>
