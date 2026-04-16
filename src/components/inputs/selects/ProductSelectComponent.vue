<script setup lang="ts">
/**
 * 商品下拉選取元件
 * 監聽 eventId + channelId 的組合，自動重新載入對應商品清單
 * 選取商品後除了 emit Option，也 emit 完整的 ProductsResBase 物件供父層取得商品詳細資訊
 */
import { ref, watch } from 'vue'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { productsApi } from '@/services/api/products/products-api'
import { orderApi } from '@/services/api/order/order-api'
import type { SelectOption } from '@/interfaces/common';

const props = defineProps<{
  /** 目前選取的活動 ID（字串形式） */
  eventId: string
  /** 目前選取的通路 ID（字串形式），未指定時改從訂單取得不重複商品清單 */
  channelId?: string
  /** 預設選取的商品 Option */
  defaultValue?: SelectOption<ProductsResBase | undefined>
  /** 是否為必填欄位 */
  required?: boolean
  /** 是否顯示「全部」選項 */
  isDisplayAll?: boolean
}>()

const emit = defineEmits<{
  /** 使用者選取商品時觸發，帶出商品對應的 Option */
  (e: 'onSelectProduct', data: SelectOption<ProductsResBase | undefined>): void
}>()

/** 轉換為 Option 格式的商品清單 */
const productOptions = ref<SelectOption<ProductsResBase | undefined>[]>([])

/** 本地管理的預設值，允許元件內部重置 */
const localDefault = ref<SelectOption<ProductsResBase | undefined> | undefined>(props.defaultValue)
watch(() => props.defaultValue, (val) => { localDefault.value = val })

// 當活動或通路變更時，重新載入商品清單
watch(
  [() => props.eventId, () => props.channelId],
  ([newEventId, newChannelId]) => {
    if (newEventId && newChannelId) {
      getProductList(newEventId, newChannelId)
    } else if (newEventId) {
      getDistinctProducts(newEventId)
    }
  },
  { immediate: true },
)

/**
 * 依活動 ID + 通路 ID 從 API 取得所有商品清單
 */
const allOption: SelectOption<undefined> = { value: undefined, name: '全部' }

async function getProductList(eventId: string, channelId: string) {
  localDefault.value = undefined
  const res = await productsApi.getProductsAll({
    eventId: Number(eventId),
    channelId: Number(channelId),
  })
  const list = res.map((p) => ({ name: p.name, value: p }))
  productOptions.value = props.isDisplayAll ? [allOption, ...list] : list
}

/**
 * 僅依活動 ID 從訂單取得不重複商品清單（通路未指定時使用）
 */
async function getDistinctProducts(eventId: string) {
  localDefault.value = undefined
  const res = await orderApi.getDistinctProducts(Number(eventId))
  const list = res.map((p) => ({ name: p.name, value: p }))
  productOptions.value = props.isDisplayAll ? [allOption, ...list] : list
}

/**
 * 使用者選取商品後，同步 localDefault 並 emit Option
 * @param option - 選取的商品 Option
 */
function onSelect(option: SelectOption<ProductsResBase | undefined>) {
  localDefault.value = option
  emit('onSelectProduct', option)
}
</script>

<template>
  <select-component
    label="商品"
    :optionList="productOptions"
    :defaultValue="localDefault"
    :required="props.required"
    @selectOption="onSelect"
  />
</template>
