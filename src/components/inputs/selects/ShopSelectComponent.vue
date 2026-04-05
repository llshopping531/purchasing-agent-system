<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { channelApi } from '@/services/api/channel-api'
const pop = defineProps<{
  eventId: string
}>()
const emit = defineEmits<{
  (e: 'selectOption', data: Option): void
}>()
const shopList = ref<Option[]>([])

function selectShop(data: Option) {
  emit('selectOption', data)
}

watch(
  () => pop.eventId,
  (newId) => {
    getChannelList(newId)
  },
)

async function getChannelList(eventId: string) {
  const channelAllRes = await channelApi.getChannelsAll(Number(eventId))
  if (channelAllRes.length !== 0) {
    shopList.value = channelAllRes.map((res) => ({
      name: res.name,
      value: res.id.toString(),
    }))
  }
}
</script>

<template>
  <select-component
    label="通路"
    :defaultValue="{ name: '', value: '' }"
    :optionList="shopList"
    @selectOption="selectShop"
  ></select-component>
</template>
