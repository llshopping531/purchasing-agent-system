<script setup lang="ts">
/**
 * 顧客下拉選取元件
 * 掛載時自動從 API 載入所有顧客清單（不分頁），支援外部傳入預設值
 */
import { ref, onMounted } from 'vue'
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { customersApi } from '@/services/api/customers/customers-api'

defineProps<{
  /** 預設選取的顧客 Option */
  defaultValue?: Option
}>()

const emit = defineEmits<{
  /** 使用者選取顧客時觸發，帶出顧客對應的 Option */
  (e: 'selectOption', data: Option): void
}>()

/** 轉換為 Option 格式的顧客清單 */
const customerList = ref<Option[]>([])

onMounted(() => {
  getCustomerList()
})

/**
 * 從 API 取得所有顧客並轉換為 Option 格式
 */
async function getCustomerList() {
  const res = await customersApi.getCustomersAll()
  customerList.value = res.map((c) => ({
    name: c.name,
    value: c.id.toString(),
  }))
}
</script>

<template>
  <select-component
    label="客戶"
    :optionList="customerList"
    :defaultValue="defaultValue"
    @selectOption="emit('selectOption', $event)"
  />
</template>
