<script setup lang="ts">
/**
 * 通路（店舖）下拉選取元件
 * 監聽 eventId prop 的變化，自動重新載入對應活動的通路清單
 */
import { ref, watch } from 'vue'
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { channelApi } from '@/services/api/channel-api'

const pop = defineProps<{
  /** 目前選取的活動 ID（字串形式），變更時自動重新查詢通路 */
  eventId: string
}>()

const emit = defineEmits<{
  /** 使用者選取通路時觸發，帶出通路對應的 Option */
  (e: 'selectOption', data: Option): void
}>()

/** 轉換為 Option 格式的通路清單 */
const shopList = ref<Option[]>([])

/**
 * 將選取的通路向上 emit
 * @param data - 選取的 Option
 */
function selectShop(data: Option) {
  emit('selectOption', data)
}

// 當活動 ID 改變時，重新載入該活動的通路清單
watch(
  () => pop.eventId,
  (newId) => {
    getChannelList(newId)
  },
)

/**
 * 依活動 ID 從 API 取得通路清單並轉換為 Option 格式
 * @param eventId - 活動 ID 字串
 */
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
