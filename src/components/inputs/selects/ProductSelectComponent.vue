<script setup lang="ts">
/**
 * 商品下拉選取元件
 * 監聽 eventId + channelId 的組合，自動重新載入對應商品清單
 * 選取商品後除了 emit Option，也 emit 完整的 ProductsResBase 物件供父層取得商品詳細資訊
 */
import { ref, watch } from 'vue'
import type { Option } from '@/interfaces/common'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { productsApi } from '@/services/api/products/products-api'

const props = defineProps<{
  /** 目前選取的活動 ID（字串形式） */
  eventId: string
  /** 目前選取的通路 ID（字串形式） */
  channelId: string
  /** 預設選取的商品 Option */
  defaultValue?: Option
}>()

const emit = defineEmits<{
  /** 使用者選取商品時觸發，帶出商品對應的 Option */
  (e: 'selectOption', data: Option): void
  /** 使用者選取商品時觸發，帶出商品完整資料（供父層取得定價等資訊） */
  (e: 'selectProduct', data: ProductsResBase): void
}>()

/** 完整商品資料陣列（用於選取後查找完整物件） */
const fullProductList = ref<ProductsResBase[]>([])
/** 轉換為 Option 格式的商品清單 */
const productOptions = ref<Option[]>([])

// 當活動或通路變更時，重新載入商品清單
watch(
  [() => props.eventId, () => props.channelId],
  ([newEventId, newChannelId]) => {
    if (newEventId && newChannelId) {
      getProductList(newEventId, newChannelId)
    }
  },
  { immediate: true },
)

/**
 * 依活動 ID + 通路 ID 從 API 取得所有商品清單
 * @param eventId - 活動 ID 字串
 * @param channelId - 通路 ID 字串
 */
async function getProductList(eventId: string, channelId: string) {
  const res = await productsApi.getProductsAll({
    eventId: Number(eventId),
    channelId: Number(channelId),
  })
  fullProductList.value = res
  productOptions.value = res.map((p) => ({
    name: p.name,
    value: p.id.toString(),
  }))
}

/**
 * 使用者選取商品後，emit Option 及完整商品物件
 * @param option - 選取的商品 Option
 */
function onSelect(option: Option) {
  emit('selectOption', option)
  const product = fullProductList.value.find((p) => p.id.toString() === option.value)
  if (product) emit('selectProduct', product)
}
</script>

<template>
  <select-component
    label="商品"
    :optionList="productOptions"
    :defaultValue="defaultValue"
    @selectOption="onSelect"
  />
</template>
