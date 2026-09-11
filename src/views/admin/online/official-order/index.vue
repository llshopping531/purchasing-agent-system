<script setup lang="ts">
/**
 * 通販官方訂單管理頁面
 * 選取通販活動後顯示官方訂單列表與該活動的所有訂單內容
 * 訂單內容支援兩種境內運費分攤模式
 */
import { onMounted, ref, computed } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { onlineOfficialOrdersApi } from '@/services/api/online/online-official-orders/online-official-orders-api'
import { onlineOrdersApi } from '@/services/api/online/online-orders/online-orders-api'
import type { QueryOnlineOfficialOrdersContent } from '@/services/api/online/online-official-orders/online-official-orders-api-interfaces'
import type { QueryOnlineOrdersContent } from '@/services/api/online/online-orders/online-orders-api-interfaces'
import type { QueryOnlineEventsContent } from '@/services/api/online/online-events/online-events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { formatTwd } from '@/utils/format'
import { useMenuStore } from '@/stores/menu'
import OnlineOfficialOrderFormModal from './OnlineOfficialOrderFormModal.vue'

const menuStore = useMenuStore()
const formModal = ref<InstanceType<typeof OnlineOfficialOrderFormModal>>()

const eventOptions = ref<SelectOption<QueryOnlineEventsContent | null>[]>([
  { name: '請選擇通販活動', value: null },
])
const currentEventId = ref('')
const currentEventIsLocked = ref(true)

// ── 官方訂單列表 ───────────────────────────────────────────────

const tableData = ref<QueryOnlineOfficialOrdersContent[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const isTableQueried = ref(false)

const headerRow: HeaderRow[] = [
  { name: '訂單名稱', value: 'name', sort: 0, mobileSpan: 2 },
  { name: '境內運費（總額）', value: 'domesticShippingTotal', sort: 1, width: '150px' },
  { name: '備註', value: 'note', sort: 3 },
]

// ── 訂單內容 ───────────────────────────────────────────────────

/** 一次全撈，方便跨官方訂單計算分攤 */
const detailData = ref<QueryOnlineOrdersContent[]>([])

/** 境內運費分攤模式：1 = 人頭平分，2 = 依商品數量平分 */
const shippingMode = ref<1 | 2>(1)

const detailHeaderRow: HeaderRow[] = [
  { name: '客戶名稱', value: 'customerName', sort: 0, width: '120px' },
  { name: '商品名稱', value: 'productName', sort: 1 },
  { name: '數量', value: 'quantity', sort: 2, width: '70px' },
  { name: '小計', value: 'subtotalTwd', sort: 3, width: '100px' },
  { name: '境內運費（分攤）', value: '_computedDomesticShipping', sort: 4, width: '150px' },
  { name: '備註', value: 'note', sort: 5 },
]

/**
 * 以官方訂單 ID 為 key，計算每筆訂單應分攤的境內運費
 * 模式一：每位不重複客戶均分
 * 模式二：依數量比例分攤
 */
const computedShippingMap = computed<Map<number, number>>(() => {
  const map = new Map<number, number>()

  // 以官方訂單 ID 分組
  const groupByOfficialOrder = new Map<number, QueryOnlineOrdersContent[]>()
  for (const row of detailData.value) {
    const key = row.officialOrderId
    if (!groupByOfficialOrder.has(key)) groupByOfficialOrder.set(key, [])
    groupByOfficialOrder.get(key)!.push(row)
  }

  // 取得官方訂單的境內運費總額
  const officialOrderTotalMap = new Map<number, number>(
    tableData.value.map((o) => [o.id, o.domesticShippingTotal ?? 0]),
  )

  for (const [officialOrderId, orders] of groupByOfficialOrder) {
    const total = officialOrderTotalMap.get(officialOrderId) ?? 0

    if (shippingMode.value === 1) {
      // 模式一：不重複客戶人數均分
      const uniqueCustomers = new Set(orders.map((o) => o.customerId)).size
      const perPerson = uniqueCustomers > 0 ? total / uniqueCustomers : 0
      for (const row of orders) map.set(row.id, Math.round(perPerson))
    } else {
      // 模式二：依數量比例分攤
      const totalQty = orders.reduce((s, o) => s + o.quantity, 0)
      for (const row of orders) {
        const share = totalQty > 0 ? (total * row.quantity) / totalQty : 0
        map.set(row.id, Math.round(share))
      }
    }
  }

  return map
})

onMounted(async () => {
  const events = await menuStore.fetchOnlineEventsAll()
  eventOptions.value = [
    { name: '請選擇通販活動', value: null },
    ...events.map((e) => ({ name: e.name, value: e })),
  ]
})

function selectEvent(option: SelectOption<QueryOnlineEventsContent | null>) {
  if (!option.value) return
  currentEventId.value = option.value.id.toString()
  currentEventIsLocked.value = option.value.isLocked
  currentPage.value = 0
  getList()
  getDetail()
}

async function getList() {
  if (!currentEventId.value) return
  const res = await onlineOfficialOrdersApi.getOnlineOfficialOrders({
    eventId: Number(currentEventId.value),
    page: currentPage.value,
    size: pageSize.value,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
  isTableQueried.value = true
}

async function getDetail() {
  if (!currentEventId.value) return
  const res = await onlineOrdersApi.getOnlineOrders({
    eventId: Number(currentEventId.value),
    size: 9999,
    page: 0,
  })
  detailData.value = res.content
}

function onChangePage(page: number) {
  currentPage.value = page
  getList()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getList()
}
</script>

<template>
  <div class="online-official-order">
    <h3>官方訂單管理</h3>
    <div class="pageHeader">
      <div class="selectBox">
        <select-component
          label="通販活動"
          :optionList="eventOptions"
          :defaultValue="eventOptions[0]"
          @selectOption="selectEvent"
        />
      </div>
      <div class="btnBox">
        <div
          class="btn"
          v-if="isTableQueried && !currentEventIsLocked"
          @click="formModal?.createOrder()"
        >
          新增
        </div>
      </div>
    </div>

    <template v-if="isTableQueried">
      <table-component
        :headerRow="headerRow"
        :tableData="tableData"
        :totalPages="totalPages"
        :currentPage="currentPage"
        :totalElements="totalElements"
        :pageSize="pageSize"
        :is-edit="!currentEventIsLocked"
        :is-delete="!currentEventIsLocked"
        @edit="formModal?.editOrder($event)"
        @delete="formModal?.deleteOrder($event)"
        @change-page="onChangePage"
        @change-size="onChangeSize"
      >
        <template #col-domesticShippingTotal="{ row }">
          {{ formatTwd(row.domesticShippingTotal) }}
        </template>
      </table-component>

      <!-- 訂單內容 -->
      <div class="detail-header">
        <span class="section-title">訂單內容</span>
        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: shippingMode === 1 }"
            @click="shippingMode = 1"
          >模式一：人頭平分</button>
          <button
            class="mode-btn"
            :class="{ active: shippingMode === 2 }"
            @click="shippingMode = 2"
          >模式二：依數量平分</button>
        </div>
      </div>

      <table-component
        :headerRow="detailHeaderRow"
        :tableData="detailData"
        :totalPages="1"
        :currentPage="0"
        :totalElements="detailData.length"
        :pageSize="detailData.length || 1"
        :is-edit="false"
        :is-delete="false"
      >
        <template #col-subtotalTwd="{ row }">{{ formatTwd(row.subtotalTwd) }}</template>
        <template #col-_computedDomesticShipping="{ row }">
          {{ formatTwd(computedShippingMap.get(row.id) ?? 0) }}
        </template>
      </table-component>
    </template>

    <online-official-order-form-modal
      ref="formModal"
      :eventId="currentEventId"
      @confirmed="getList"
    />
  </div>
</template>

<style scoped>
.online-official-order {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .pageHeader {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    flex-wrap: wrap;
    .selectBox {
      display: flex;
      gap: 1rem;
    }
    .btnBox {
      display: flex;
      gap: 1rem;
    }
  }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
}

.mode-toggle {
  display: flex;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.mode-btn {
  padding: 0.3rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  & + & {
    border-left: 1.5px solid var(--color-border);
  }

  &.active {
    background: var(--color-primary);
    color: #fff;
  }
}
</style>
