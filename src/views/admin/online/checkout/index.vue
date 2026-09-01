<script setup lang="ts">
/**
 * 通販結帳單管理 - 列表頁
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { useCheckoutStore, type CheckoutBill } from '@/stores/checkout'
import { formatTwd } from '@/utils/format'
import { PATH } from '@/constants/route.constant'

const router = useRouter()
const checkoutStore = useCheckoutStore()

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  '已收款': { background: '#dcfce7', color: '#16a34a' },
  '收款中': { background: '#fef9c3', color: '#a16207' },
  '未收款': { background: '#f1f5f9', color: '#94a3b8' },
}

const headerRow: HeaderRow[] = [
  { name: '名稱', value: 'name', sort: 0, mobileSpan: 2 },
  { name: '截止日', value: 'deadline', sort: 1, width: '120px' },
  { name: '狀態', value: '_status', sort: 2, width: '90px' },
  { name: '包含活動', value: '_eventNames', sort: 3 },
  { name: '顧客數', value: '_customerCount', sort: 4, width: '80px' },
  { name: '總金額', value: '_total', sort: 5, width: '120px' },
]

const tableData = computed(() =>
  checkoutStore.bills.map((b) => ({
    ...b,
    _status: b.status,
    _eventNames: b.eventNames.join('、'),
    _customerCount: b.rows.length,
    _total: b.total,
  })),
)

function onEdit(row: CheckoutBill) {
  router.push(`${PATH.checkout}/${row.id}/edit`)
}

function onDelete(row: CheckoutBill) {
  checkoutStore.remove(row.id)
}
</script>

<template>
  <div class="checkout-page">
    <h3>結帳單管理</h3>

    <div class="pageHeader">
      <div class="btnBox">
        <div class="btn" @click="router.push(PATH.checkoutNew)">新增</div>
      </div>
    </div>

    <table-component
      :headerRow="headerRow"
      :tableData="tableData"
      :isEdit="true"
      :isDelete="true"
      :rowClass="() => 'clickable-row'"
      @row-click="router.push(`${PATH.checkout}/${$event.id}`)"
      @edit="onEdit($event)"
      @delete="onDelete($event)"
    >
      <template #col-_status="{ row }">
        <span class="status-badge" :style="STATUS_STYLE[row._status]">{{ row._status }}</span>
      </template>
      <template #col-_total="{ row }">
        {{ formatTwd(row._total) }}
      </template>
    </table-component>
  </div>
</template>

<style scoped>
.checkout-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pageHeader {
  .btnBox {
    display: flex;
    gap: 1rem;
  }
}

.status-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.6rem;
  border-radius: 99px;
  white-space: nowrap;
}

:deep(.clickable-row) {
  cursor: pointer;

  &:hover .item-col {
    background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
  }
}
</style>
