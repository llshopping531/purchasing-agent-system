<script setup lang="ts">
/**
 * 通販結帳單管理 - 列表頁
 * 分成兩區：未收款／收款中（可編輯），以及已收款（僅可檢視）
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { checkoutApi } from '@/services/api/online/checkout/checkout-api'
import type { CheckoutBillRes } from '@/services/api/online/checkout/checkout-api-interfaces'
import { formatTwd } from '@/utils/format'
import { PATH } from '@/constants/route.constant'

const router = useRouter()

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
  { name: '總金額', value: '_total', sort: 4, width: '120px' },
]

const bills = ref<(CheckoutBillRes & { _status: string; _eventNames: string; _total: string })[]>([])

const inProgressBills = computed(() => bills.value.filter((b) => b.status !== '已收款'))
const paidBills = computed(() => bills.value.filter((b) => b.status === '已收款'))

async function getList() {
  const res = await checkoutApi.getCheckoutBills()
  bills.value = res.map((b) => ({
    ...b,
    _status: b.status,
    _eventNames: b.eventNames.join('、'),
    _total: formatTwd(b.total),
  }))
}

onMounted(getList)

function onEdit(row: CheckoutBillRes) {
  router.push(`${PATH.checkout}/${row.id}/edit`)
}

async function onDelete(row: CheckoutBillRes) {
  await checkoutApi.deleteCheckoutBill(row.id)
  await getList()
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

    <div class="section">
      <div class="section-title">未收款／收款中</div>
      <table-component
        :headerRow="headerRow"
        :tableData="inProgressBills"
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
      </table-component>
    </div>

    <div class="section">
      <div class="section-title">已收款</div>
      <table-component
        :headerRow="headerRow"
        :tableData="paidBills"
        :isEdit="false"
        :isDelete="true"
        :rowClass="() => 'clickable-row'"
        @row-click="router.push(`${PATH.checkout}/${$event.id}`)"
        @delete="onDelete($event)"
      >
        <template #col-_status="{ row }">
          <span class="status-badge" :style="STATUS_STYLE[row._status]">{{ row._status }}</span>
        </template>
      </table-component>
    </div>
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

.section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
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
