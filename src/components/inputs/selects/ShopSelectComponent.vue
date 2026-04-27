<script setup lang="ts">
/**
 * 通路（店舖）下拉選取元件
 * 監聽 eventId prop 的變化，自動重新載入對應活動的通路清單
 */
import { ref, watch } from 'vue'
import type { SelectOption } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { useMenuStore } from '@/stores/menu'
import type { QueryChannelsAllRes } from '@/services/api/offline/channels/channels-api-interfaces'

const pop = defineProps<{
  /** 目前選取的活動 ID（字串形式），變更時自動重新查詢通路 */
  eventId: string
  /** 是否顯示選項 全部 */
  isShowAll?: boolean
  /** 是否為必填欄位 */
  required?: boolean
  /** 初始選取的通路 ID（用於還原暫存狀態） */
  initialId?: string
}>()

const defaultValue = ref<SelectOption<QueryChannelsAllRes | null>>({ name: '請選擇通路', value: null })

const emit = defineEmits<{
  /** 使用者選取通路時觸發，帶出通路對應的 ShopOption */
  (e: 'selectOption', data: SelectOption<QueryChannelsAllRes | null>): void
}>()

const menuStore = useMenuStore()
/** 轉換為 Option 格式的通路清單 */
const shopList = ref<SelectOption<QueryChannelsAllRes | null>[]>([{ name: '請選擇通路', value: null }])

/**
 * 將選取的通路向上 emit（附帶匯率）
 * @param data - 選取的 Option
 */
function selectShop(data: SelectOption<QueryChannelsAllRes | null>) {
  emit('selectOption', data)
}

// 當活動 ID 改變時，重新載入該活動的通路清單；immediate 確保掛載時也會執行
watch(
  () => pop.eventId,
  (newId) => {
    getChannelList(newId)
    if (pop.isShowAll) defaultValue.value = { name: '全部', value: null }
  },
  { immediate: true },
)

/**
 * 依活動 ID 從 API 取得通路清單並轉換為 Option 格式
 * @param eventId - 活動 ID 字串
 */
async function getChannelList(eventId: string) {
  const channelAllRes = await menuStore.fetchChannelsAll(Number(eventId))
  if (channelAllRes.length !== 0) {
    shopList.value = channelAllRes.map((res) => ({
      name: res.name,
      value: res,
    }))
    if (pop.isShowAll) {
      shopList.value.unshift({ name: '全部', value: null })
    }
    if (pop.initialId) {
      const found = shopList.value.find((opt) => opt.value?.id.toString() === pop.initialId)
      if (found) defaultValue.value = found
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
