<script setup lang="ts">
import MergedTableComponent, { type ColumnDef } from './MergedTableComponent.vue'

export interface ShippingItem {
  name: string
  quantity: number
  price: number
  japanShippingCost: number
  internationaShippingCost: number
}

export interface ShippingEvent {
  eventName: string
  items: ShippingItem[]
  shippingCostTotal: number
}

export interface ShippingRow {
  customerName: string
  eventList: ShippingEvent[]
  packaging: number
  shippingTotal: number
  shipped: boolean
  note: string
}

defineProps<{
  rows: ShippingRow[]
}>()

const columns: ColumnDef[] = [
  { key: 'customerName',             label: '訂購者',       level: 'row' },
  { key: 'eventName',                label: '團務名',       level: 'group' },
  { key: 'name',                     label: '品項',         level: 'item' },
  { key: 'quantity',                 label: '數量',         level: 'item',  align: 'center' },
  { key: 'price',                    label: '商品剩餘金額', level: 'item',  align: 'center' },
  { key: 'japanShippingCost',        label: '日本運費',     level: 'item',  align: 'center' },
  { key: 'internationaShippingCost', label: '國際運費',     level: 'item',  align: 'center' },
  { key: 'shippingCostTotal',        label: '二補總和',     level: 'group', align: 'center' },
  { key: 'packaging',                label: '包材',         level: 'row',   align: 'center' },
  { key: 'shippingTotal',            label: '寄貨便總金額', level: 'row',   align: 'center' },
  { key: 'shipped',                  label: '已寄出',       level: 'row',   align: 'center' },
  { key: 'note',                     label: '備註',         level: 'row' },
]
</script>

<template>
  <merged-table-component
    :columns="columns"
    :rows="rows"
    groups-key="eventList"
    items-key="items"
  >
    <!-- shipped 用 checkbox 自訂元素 -->
    <template #shipped="{ row }">
      <input type="checkbox" v-model="row.shipped" />
    </template>
  </merged-table-component>
</template>

<style scoped>
input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--color-primary);
}
</style>
