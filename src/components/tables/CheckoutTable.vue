<script setup lang="ts">
import MergedTableComponent, { type ColumnDef } from './MergedTableComponent.vue'

export interface CheckoutItem {
  /** 品項 */
  name: string
  /** 數量 */
  quantity: number
  /** 單價(台幣) */
  unitPrice: number
  /** 小計(台幣)：quantity × unitPrice */
  itemTotal: number
}

export interface CheckoutEvent {
  /** 團務名 */
  eventName: string
  /** 品項列表 */
  items: CheckoutItem[]
}

export interface CheckoutRow {
  /** 訂購者 */
  customerName: string
  /** 團務列表 */
  eventList: CheckoutEvent[]
  /** 合計 */
  total:string
  /** 已對帳 */
  reconciled: boolean
  /** 備註 */
  note: string
}

defineProps<{
  rows: CheckoutRow[]
}>()

const columns: ColumnDef[] = [
  { key: 'customerName', label: '訂購者', level: 'row' },
  { key: 'eventName', label: '團務名', level: 'group' },
  { key: 'name', label: '品項', level: 'item' },
  { key: 'quantity', label: '數量', level: 'item', align: 'center' },
  { key: 'unitPrice', label: '單價(台幣)', level: 'item', align: 'center' },
  { key: 'itemTotal', label: '小計(台幣)', level: 'item', align: 'center' },
  { key: 'total', label: '合計', level: 'row', align: 'center' },
  { key: 'reconciled', label: '已對帳', level: 'row', align: 'center' },
  { key: 'note', label: '備註', level: 'row' },
]
</script>

<template>
  <merged-table-component :columns="columns" :rows="rows" groups-key="eventList" items-key="items">
    <!-- reconciled 用 checkbox 自訂元素 -->
    <template #reconciled="{ row }">
      <input type="checkbox" v-model="row.reconciled" />
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
