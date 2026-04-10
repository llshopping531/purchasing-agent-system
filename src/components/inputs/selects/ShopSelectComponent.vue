<script setup lang="ts">
/**
 * 通路（店舖）下拉選取元件
 * 監聽 eventId prop 的變化，自動重新載入對應活動的通路清單
 */
import { ref, watch } from 'vue'
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { channelApi } from '@/services/api/channels/channels-api'

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
  /** 使用者選取通路時觸發，帶出通路對應的 Option */
  (e: 'selectOption', data: Option): void
}>()

/** 轉換為 Option 格式的通路清單 */
const shopList = ref<Option[]>([{ name: '請選擇通路', value: '請選擇通路' }])

/**
 * 將選取的通路向上 emit
 * @param data - 選取的 Option
 */
function selectShop(data: Option) {
  emit('selectOption', data)
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
  const channelAllRes = await channelApi.getChannelsAll({ eventId: Number(eventId) })
  if (channelAllRes.length !== 0) {
    shopList.value = channelAllRes.map((res) => ({
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
