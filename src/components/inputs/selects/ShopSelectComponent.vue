<script setup lang="ts">
/**
 * 通路（店舖）下拉選取元件
 * 監聽 eventId prop 的變化，自動重新載入對應活動的通路清單
 */
import { ref, watch } from 'vue'
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { channelApi } from '@/services/api/channels/channels-api'
import type { QueryChannelsAllRes } from '@/services/api/channels/channels-api-interfaces'

export interface ShopOption {
  selectedData: Option
  exchangeRate: number
}

const pop = defineProps<{
  /** 目前選取的活動 ID（字串形式），變更時自動重新查詢通路 */
  eventId: string
  /** 是否顯示選項 全部 */
  isShowAll?: boolean
  /** 是否為必填欄位 */
  required?: boolean
}>()

const defaultValue = ref<Option>({ name: '請選擇通路', value: '請選擇通路' })

const emit = defineEmits<{
  /** 使用者選取通路時觸發，帶出通路對應的 ShopOption */
  (e: 'selectOption', data: ShopOption): void
}>()

/** 原始通路清單（保留完整資料以供 emit 使用） */
const channelAllRes = ref<QueryChannelsAllRes[]>([])
/** 轉換為 Option 格式的通路清單 */
const shopList = ref<Option[]>([{ name: '請選擇通路', value: '請選擇通路' }])

/**
 * 將選取的通路向上 emit（附帶匯率）
 * @param data - 選取的 Option
 */
function selectShop(data: Option) {
  const channel = channelAllRes.value.find((c) => c.id === Number(data.value))
  emit('selectOption', { selectedData: data, exchangeRate: channel?.exchangeRate ?? 0 })
}

// 當活動 ID 改變時，重新載入該活動的通路清單；immediate 確保掛載時也會執行
watch(
  () => pop.eventId,
  (newId) => {
    getChannelList(newId)
    if (pop.isShowAll) defaultValue.value = { name: '全部', value: '' }
  },
  { immediate: true },
)

/**
 * 依活動 ID 從 API 取得通路清單並轉換為 Option 格式
 * @param eventId - 活動 ID 字串
 */
async function getChannelList(eventId: string) {
  channelAllRes.value = await channelApi.getChannelsAll({ eventId: Number(eventId) })
  if (channelAllRes.value.length !== 0) {
    shopList.value = channelAllRes.value.map((res) => ({
      name: res.name,
      value: res.id.toString(),
    }))
    if (pop.isShowAll) {
      shopList.value.unshift({ name: '全部', value: '' })
    }
  }
}
</script>

<template>
  <select-component
    label="通路"
    :defaultValue="defaultValue"
    :optionList="shopList"
    :required="pop.required"
    @selectOption="selectShop"
  ></select-component>
</template>
