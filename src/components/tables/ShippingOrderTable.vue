<script setup lang="ts">
import MergedTableComponent, { type ColumnDef } from './MergedTableComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import type { ShippingOrderRowData } from '@/stores/shippingOrder'

export type { ShippingOrderRowData }

defineProps<{
  rows: ShippingOrderRowData[]
}>()

const columns: ColumnDef[] = [
  { key: 'customerName', label: '訂購者', level: 'row' },
  { key: 'eventName', label: '活動名稱', level: 'group' },
  { key: 'name', label: '品項', level: 'item' },
  { key: 'quantity', label: '數量', level: 'item', align: 'center' },
  { key: 'unitPrice', label: '單價(台幣)', level: 'item', align: 'center' },
  { key: 'itemTotal', label: '小計(台幣)', level: 'item', align: 'center' },
  { key: 'remainingAmount', label: '剩餘未付金額', level: 'row', align: 'center' },
  { key: 'domesticShipping', label: '境內運費', level: 'row', align: 'center' },
  { key: 'internationalShipping', label: '國際運費', level: 'row', align: 'center' },
  { key: 'packagingFee', label: '包材費', level: 'row', align: 'center' },
  { key: 'note', label: '備註', level: 'row' },
]
</script>

<template>
  <merged-table-component :columns="columns" :rows="rows" groups-key="eventList" items-key="items">
    <template #remainingAmount="{ row }">
      <text-input
        label=""
        :value="row.remainingAmount === 0 ? '' : String(row.remainingAmount)"
        @update:value="row.remainingAmount = Number($event) || 0"
      />
    </template>
    <template #domesticShipping="{ row }">
      {{ row.domesticShipping === 0 ? '—' : row.domesticShipping }}
    </template>
    <template #internationalShipping="{ row }">
      <text-input
        label=""
        :value="row.internationalShipping === 0 ? '' : String(row.internationalShipping)"
        @update:value="row.internationalShipping = Number($event) || 0"
      />
    </template>
    <template #packagingFee="{ row }">
      <text-input
        label=""
        :value="row.packagingFee === 0 ? '' : String(row.packagingFee)"
        @update:value="row.packagingFee = Number($event) || 0"
      />
    </template>
    <template #note="{ row }">
      <text-input label="" placeholder="輸入備註…" v-model:value="row.note" />
    </template>
  </merged-table-component>
</template>
