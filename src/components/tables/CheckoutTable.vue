<script setup lang="ts">
import MergedTableComponent, { type ColumnDef } from './MergedTableComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import type { CheckoutRowData } from '@/stores/checkout'

export type { CheckoutRowData }

defineProps<{
  rows: CheckoutRowData[]
}>()

const columns: ColumnDef[] = [
  { key: 'customerName', label: '訂購者', level: 'row' },
  { key: 'eventName', label: '活動名稱', level: 'group' },
  { key: 'name', label: '品項', level: 'item' },
  { key: 'quantity', label: '數量', level: 'item', align: 'center' },
  { key: 'unitPrice', label: '單價(台幣)', level: 'item', align: 'center' },
  { key: 'itemTotal', label: '小計(台幣)', level: 'item', align: 'center' },
  { key: 'total', label: '合計', level: 'row', align: 'center' },
  { key: 'reconciled', label: '已對帳', level: 'row', align: 'center' },
  { key: 'remainingAmount', label: '商品未付金額', level: 'row', align: 'center' },
  { key: 'note', label: '備註', level: 'row' },
]
</script>

<template>
  <merged-table-component :columns="columns" :rows="rows" groups-key="eventList" items-key="items">
    <template #remainingAmount="{ row }">
      <text-input
        label=""
        :value="(row.remainingAmount ?? 0) === 0 ? '' : String(row.remainingAmount)"
        @update:value="row.remainingAmount = Number($event) || 0"
      />
    </template>
    <template #reconciled="{ row }">
      <checkbox-input label="" v-model="row.reconciled" />
    </template>
    <template #note="{ row }">
      <text-input label="" placeholder="輸入備註…" v-model:value="row.note" />
    </template>
  </merged-table-component>
</template>

