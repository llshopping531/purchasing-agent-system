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
    /** 是否為複選模式 */
    multiple?: boolean
  }>(),
  {
    isDisplayLable: true,
    multiple: false,
  },
)

const emit = defineEmits<{
  /** 單選：使用者選取訂單狀態時觸發 */
  (e: 'selectOption', data: SelectOption<string | undefined>): void
  /** 複選：選取項目變更時觸發 */
  (e: 'selectOptions', data: SelectOption<string | undefined>[]): void
}>()

/** 訂單狀態靜態選項清單 */
const orderStatusOptions: SelectOption<string | undefined>[] = [
  { value: '1', name: '已喊單', color: '#2563eb' },
  { value: '2', name: '已購買', color: '#16a34a' },
  { value: '3', name: '已取消', color: '#dc2626' },
  { value: '4', name: '缺貨',   color: '#d97706' },
]

/** 訂單狀態靜態選項清單 */
const orderStatusAllOptions: SelectOption<string | undefined>[] = [
  { value: undefined, name: '全部' },
  { value: '1', name: '已喊單', color: '#2563eb' },
  { value: '2', name: '已購買', color: '#16a34a' },
  { value: '3', name: '已取消', color: '#dc2626' },
  { value: '4', name: '缺貨',   color: '#d97706' },
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
    :optionList="isDisplayAll && !multiple ? orderStatusAllOptions : orderStatusOptions"
    :defaultValue="multiple ? undefined : getOrderStatusOption(defaultValue)"
    :required="required"
    :multiple="multiple"
    @selectOption="emit('selectOption', $event)"
    @selectOptions="emit('selectOptions', $event)"
  />
</template>
