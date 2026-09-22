<script setup lang="ts">
import { computed } from 'vue'
import MergedTableComponent, { type ColumnDef } from './MergedTableComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import type { CheckoutRowRes } from '@/services/api/online/checkout/checkout-api-interfaces'
import { formatTwd } from '@/utils/format'

/** 結帳單表格列資料（在 API 回傳的 row 上額外附加前端用的數值合計） */
export type CheckoutRowData = CheckoutRowRes & { _totalAmount: number }

const props = withDefaults(
  defineProps<{
    rows: CheckoutRowData[]
    /** 是否顯示對帳相關欄位（已對帳／商品未付金額／備註），僅詳細頁的對帳流程需要 */
    showReconciliation?: boolean
    /** 對帳欄位是否可編輯，false 時改為純顯示（供對外分享頁面使用） */
    interactive?: boolean
    /** 是否顯示備註欄位（僅在 showReconciliation 為 true 時有意義） */
    showNote?: boolean
  }>(),
  { showReconciliation: true, interactive: true, showNote: true },
)

const baseColumns: ColumnDef[] = [
  { key: 'customerName', label: '訂購者', level: 'row' },
  { key: 'eventName', label: '活動名稱', level: 'group' },
  { key: 'name', label: '品項', level: 'item' },
  { key: 'quantity', label: '數量', level: 'item', align: 'center' },
  { key: 'unitPrice', label: '單價(台幣)', level: 'item', align: 'center' },
  { key: 'itemTotal', label: '小計(台幣)', level: 'item', align: 'center' },
  { key: 'total', label: '合計', level: 'row', align: 'center' },
]

const reconciliationColumns = computed<ColumnDef[]>(() => {
  const cols: ColumnDef[] = [
    { key: 'reconciled', label: '已對帳', level: 'row', align: 'center' },
    { key: 'remainingAmount', label: '商品未付金額', level: 'row', align: 'center' },
  ]
  if (props.showNote) cols.push({ key: 'note', label: '備註', level: 'row' })
  return cols
})

const columns = computed<ColumnDef[]>(() =>
  props.showReconciliation ? [...baseColumns, ...reconciliationColumns.value] : baseColumns,
)
</script>

<template>
  <merged-table-component :columns="columns" :rows="rows" groups-key="eventList" items-key="items">
    <template #remainingAmount="{ row }">
      <text-input
        v-if="interactive"
        label=""
        :value="(row.remainingAmount ?? 0) === 0 ? '' : String(row.remainingAmount)"
        @update:value="row.remainingAmount = Number($event) || 0"
      />
      <span v-else>{{ (row.remainingAmount ?? 0) === 0 ? '-' : formatTwd(row.remainingAmount) }}</span>
    </template>
    <template #reconciled="{ row }">
      <checkbox-input v-if="interactive" label="" v-model="row.reconciled" />
      <span v-else>{{ row.reconciled ? '✓ 已對帳' : '未對帳' }}</span>
    </template>
    <template #note="{ row }">
      <text-input v-if="interactive" label="" placeholder="輸入備註…" v-model:value="row.note" />
      <span v-else>{{ row.note || '-' }}</span>
    </template>
  </merged-table-component>
</template>
