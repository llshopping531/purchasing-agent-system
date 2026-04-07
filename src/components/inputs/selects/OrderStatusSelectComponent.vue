<script setup lang="ts">
/**
 * 訂單狀態下拉選取元件
 * 使用靜態選項清單，無需 API 請求
 */
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'

defineProps<{
  /** 預設選取的訂單狀態 Option */
  defaultValue?: Option
  /** 是否為必填欄位 */
  required?: boolean
}>()

const emit = defineEmits<{
  /** 使用者選取訂單狀態時觸發，帶出對應的 Option */
  (e: 'selectOption', data: Option): void
}>()

/** 訂單狀態靜態選項清單 */
const orderStatusOptions: Option[] = [
  { value: '1', name: '已喊單' },
  { value: '2', name: '已購買' },
  { value: '3', name: '已取消' },
]
</script>

<template>
  <select-component
    label="訂單狀態"
    :optionList="orderStatusOptions"
    :defaultValue="defaultValue"
    :required="required"
    @selectOption="emit('selectOption', $event)"
  />
</template>
