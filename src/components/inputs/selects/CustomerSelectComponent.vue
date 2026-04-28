<script setup lang="ts">
/**
 * 顧客下拉選取元件
 * 掛載時自動從 API 載入所有顧客清單（不分頁），支援外部傳入預設值
 */
import { ref, onMounted, watch } from 'vue'
import type { SelectOption } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { customersApi } from '@/services/api/offline/customers/customers-api'
import type { CustomersResBase } from '@/services/api/offline/customers/customers-api-interfaces'
import { orderApi } from '@/services/api/offline/order/order-api'
const props = withDefaults(
  defineProps<{
    /** 預設選取的顧客 Option */
    defaultValue?: SelectOption<CustomersResBase | undefined>
    /** 是否為必填欄位 */
    required?: boolean
    /** 標題 */
    title?: string
    eventId?: string
    channelId?: string
    /** 是否顯示「全部」選項 */
    isDisplayAll?: boolean
  }>(),
  {
    /** 標題 */
    title: '顧客',
  },
)

const emit = defineEmits<{
  /** 使用者選取顧客時觸發，帶出顧客對應的 Option */
  (e: 'selectOption', data: SelectOption<CustomersResBase | undefined>): void
}>()

/** 轉換為 Option 格式的顧客清單 */
const customerList = ref<SelectOption<CustomersResBase | undefined>[]>([])

/** 本地管理的預設值，允許元件內部重置 */
const localDefault = ref(props.defaultValue)
watch(
  () => props.defaultValue,
  (val) => {
    localDefault.value = val
  },
)

onMounted(() => {
  if (props.eventId) {
    getDistinctCustomers(Number(props.eventId))
  } else {
    getCustomerList()
  }
})

// 當活動或通路變更時，重新載入顧客清單
watch(
  [() => props.eventId, () => props.channelId],
  ([newEventId, newChannelId]) => {
    if (newEventId && newChannelId) {
      getDistinctCustomers(Number(newEventId), Number(newChannelId))
    } else if (newEventId) {
      getDistinctCustomers(Number(newEventId))
    }
  },
  { immediate: true },
)

/**
 * 從 API 取得所有顧客並轉換為 Option 格式
 */
const allOption: SelectOption<undefined> = { value: undefined, name: '全部' }

async function getCustomerList() {
  const res = await customersApi.getCustomersAll()
  const list = res.map((customer) => ({ name: customer.name, value: customer }))
  customerList.value = props.isDisplayAll ? [allOption, ...list] : list
}

async function getDistinctCustomers(enentId: number, chaanelId?: number) {
  const res = await orderApi.getDistinctCustomers(enentId, chaanelId)
  const list = res.map((customer) => ({ name: customer.name, value: customer }))
  customerList.value = props.isDisplayAll ? [allOption, ...list] : list
}

function selectOption($event: SelectOption<CustomersResBase | undefined>) {
  localDefault.value = $event
  emit('selectOption', $event)
}
</script>

<template>
  <select-component
    :label="title"
    :optionList="customerList"
    :defaultValue="localDefault"
    :required="required"
    @selectOption="selectOption($event)"
  />
</template>
