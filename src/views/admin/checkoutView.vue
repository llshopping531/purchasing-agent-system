<script setup lang="ts">
import { ref } from 'vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckoutTable, { type CheckoutRow } from '@/components/tables/CheckoutTable.vue'
import type { Option } from '@/interfaces/common'

const monthList: Option[] = [
  { value: '1', name: '1月' },
  { value: '2', name: '2月' },
  { value: '3', name: '3月' },
  { value: '4', name: '4月' },
  { value: '5', name: '5月' },
  { value: '6', name: '6月' },
  { value: '7', name: '7月' },
  { value: '8', name: '8月' },
  { value: '9', name: '9月' },
  { value: '10', name: '10月' },
  { value: '11', name: '11月' },
  { value: '12', name: '12月' },
]

const selectedMonth = ref<Option | undefined>(undefined)
const customerFilter = ref('')

const tableData = ref<CheckoutRow[]>([
  {
    customerName: '吃蘋果',
    eventList: [
      {
        eventName: '我英應募資料夾',
        items: [
          { name: '蟲', quantity: 5, unitPrice: 200, itemTotal: 1000 },
          { name: '全員', quantity: 1, unitPrice: 350, itemTotal: 350 },
        ]
      },
      {
        eventName: '坂本高空降落',
        items: [
          { name: '徽章 抱盒', quantity: 1, unitPrice: 500, itemTotal: 500 },
        ]
      },
    ],
    total: '1000',
    reconciled: false,
    note: '與三月連綜合併出貨',
  },
  {
    customerName: '弥',
    eventList: [
      {
        eventName: '我英應募資料夾',
        items: [
          { name: '爆豪', quantity: 1, unitPrice: 200, itemTotal: 200 },
          { name: '綠谷', quantity: 1, unitPrice: 200, itemTotal: 200 },
          { name: '蟲', quantity: 1, unitPrice: 200, itemTotal: 200 },
          { name: '全員', quantity: 1, unitPrice: 350, itemTotal: 350 },
        ],
      },
    ],
    total: '1000',
    reconciled: true,
    note: '',
  },
])

function selectMonth(option: Option) {
  selectedMonth.value = option
}
</script>

<template>
  <div class="checkoutView">
    <h3>結帳單</h3>
    <div class="filter-bar">
      <select-component
        label="月份"
        :defaultValue="selectedMonth"
        :optionList="monthList"
        @selectOption="selectMonth"
      />
      <text-input label="顧客篩選" placeholder="輸入顧客姓名" v-model:value="customerFilter" />
    </div>
    <checkout-table :rows="tableData" />
  </div>
</template>

<style scoped>
.checkoutView {
  padding: 1rem;
}

.filter-bar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 1rem;
}
</style>
