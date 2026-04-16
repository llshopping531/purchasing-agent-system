<script setup lang="ts">
/**
 * 訂單狀態下拉選取元件
 * 使用靜態選項清單，無需 API 請求
 */
import type { SelectOption } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
const pops = withDefaults(
  defineProps<{
    /** 預設選取的訂單狀態 */
    defaultValue: string | undefined
    /** 是否為必填欄位 */
    required?: boolean
    /** 是否顯示欄位名稱 */
    isDisplayLable?: boolean
    /** 是否顯示全部 */
    isDisplayAll?: boolean
  }>(),
  {
    isDisplayLable: true,
  },
)

const emit = defineEmits<{
  /** 使用者選取訂單狀態時觸發，帶出對應的 Option */
  (e: 'selectOption', data: SelectOption<string | undefined>): void
}>()

/** 訂單狀態靜態選項清單 */
const orderStatusOptions: SelectOption<string | undefined>[] = [
  { value: '1', name: '已喊單' },
  { value: '2', name: '已購買' },
  { value: '3', name: '已取消' },
  { value: '4', name: '缺貨' },
]

/** 訂單狀態靜態選項清單 */
const orderStatusAllOptions: SelectOption<string | undefined>[] = [
  { value: undefined, name: '全部' },
  { value: '1', name: '已喊單' },
  { value: '2', name: '已購買' },
  { value: '3', name: '已取消' },
  { value: '4', name: '缺貨' },
]

function getOrderStatusOption(orderStatus: string | undefined) {
  if (pops.isDisplayAll) return orderStatusAllOptions.find((option) => option.value === orderStatus)
  return orderStatusOptions.find((option) => option.value === orderStatus)
}
</script>

<template>
  <select-component
    label="訂單狀態"
    :isDisplayLable="isDisplayLable"
    :optionList="isDisplayAll ? orderStatusAllOptions : orderStatusOptions"
    :defaultValue="getOrderStatusOption(defaultValue)"
    :required="required"
    @selectOption="emit('selectOption', $event)"
  />
</template>
