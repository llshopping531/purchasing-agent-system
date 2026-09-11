<script setup lang="ts">
/**
 * 通販訂單管理頁面
 * 初始顯示通販活動列表，點擊列後進入該活動的訂單列表
 */
import { computed, onMounted, ref } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import { onlineOrdersApi } from '@/services/api/online/online-orders/online-orders-api'
import { onlineProductsApi } from '@/services/api/online/online-products/online-products-api'
import type { QueryOnlineOrdersContent } from '@/services/api/online/online-orders/online-orders-api-interfaces'
import type { QueryOnlineEventsContent } from '@/services/api/online/online-events/online-events-api-interfaces'
import { formatTwd, formatJpy } from '@/utils/format'
import { useMenuStore } from '@/stores/menu'
import OnlineOrderFormModal from './OnlineOrderFormModal.vue'
import OnlineBatchOrderFormModal from './OnlineBatchOrderFormModal.vue'

const menuStore = useMenuStore()

const orderFormModal = ref<InstanceType<typeof OnlineOrderFormModal>>()
const isBatchModalOpen = ref(false)

/** 通販活動列表 */
const events = ref<QueryOnlineEventsContent[]>([])
/** 當前選取的活動（null = 顯示活動列表） */
const currentEvent = ref<QueryOnlineEventsContent | null>(null)

/** 訂單列表資料 */
const orderData = ref<QueryOnlineOrdersContent[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const isTableQueried = ref(false)

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  '進行中': { background: '#dcfce7', color: '#16a34a' },
  '已鎖定': { background: '#f1f5f9', color: '#94a3b8' },
}

const eventHeaderRow: HeaderRow[] = [
  { name: '活動名稱', value: 'name', sort: 0, mobileSpan: 2 },
  { name: '開團日期', value: 'startDate', sort: 1, width: '120px' },
  { name: '官方出貨日', value: 'deliveryDate', sort: 2, width: '120px' },
  { name: '進度', value: 'progressName', sort: 3, width: '120px' },
  { name: '狀態', value: '_status', sort: 4, width: '90px' },
]

const eventTableData = computed(() =>
  events.value.map((e) => ({
    ...e,
    _status: e.isLocked ? '已鎖定' : '進行中',
  })),
)

const orderHeaderRow: HeaderRow[] = [
  { name: '客戶名稱', value: 'customerName', sort: 0, width: '120px', mobileSpan: 2 },
  { name: '商品名稱', value: 'productName', sort: 0 },
  { name: '數量', value: 'quantity', sort: 0, width: '70px' },
  { name: '小計（TWD）', value: 'subtotalTwd', sort: 0, width: '110px' },
  { name: '重量（g）', value: 'productWeight', sort: 0, width: '90px' },
  { name: '境內運費', value: 'domesticShipping', sort: 0, width: '100px' },
  { name: '國際運費', value: 'internationalShipping', sort: 0, width: '100px' },
  { name: '備註', value: 'note', sort: 0 },
  { name: '官方訂單', value: 'officialOrderName', sort: 0 },
]

onMounted(async () => {
  events.value = await menuStore.fetchOnlineEventsAll()
})

function selectEvent(event: QueryOnlineEventsContent) {
  currentEvent.value = event
  currentPage.value = 0
  isTableQueried.value = false
  isBatchModalOpen.value = false
  getOrderList()
}

function goBack() {
  currentEvent.value = null
  isTableQueried.value = false
  orderData.value = []
}

async function getOrderList() {
  if (!currentEvent.value) return
  const res = await onlineOrdersApi.getOnlineOrders({
    eventId: currentEvent.value.id,
    page: currentPage.value,
    size: pageSize.value,
  })
  orderData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
  isTableQueried.value = true
}

function onChangePage(page: number) {
  currentPage.value = page
  getOrderList()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getOrderList()
}

// ── 總計彈窗 ──────────────────────────────────────────────────
interface StatsItem {
  productName: string
  quantity: number
}

const isStatsOpen = ref(false)
const statsLoading = ref(false)
const statsTotalQty = ref(0)
const statsTotalTwd = ref(0)
const statsTotalJpy = ref(0)
const statsItems = ref<StatsItem[]>([])

const statsHeaderRow: HeaderRow[] = [
  { name: '品項', value: 'productName', sort: 0 },
  { name: '數量', value: 'quantity', sort: 1, width: '80px' },
]

async function openStats() {
  if (!currentEvent.value) return
  isStatsOpen.value = true
  statsLoading.value = true

  const [ordersRes, productsRes] = await Promise.all([
    onlineOrdersApi.getOnlineOrders({ eventId: currentEvent.value.id, size: 9999 }),
    onlineProductsApi.getOnlineProducts({ eventId: currentEvent.value.id, size: 1000 }),
  ])

  const priceJpyMap = new Map(productsRes.content.map((p) => [p.id, p.priceJpy]))

  let totalQty = 0
  let totalTwd = 0
  let totalJpy = 0
  const itemMap: Record<string, number> = {}

  for (const order of ordersRes.content) {
    totalQty += order.quantity
    totalTwd += order.subtotalTwd
    totalJpy += (priceJpyMap.get(order.productId) ?? 0) * order.quantity
    itemMap[order.productName] = (itemMap[order.productName] ?? 0) + order.quantity
  }

  statsTotalQty.value = totalQty
  statsTotalTwd.value = totalTwd
  statsTotalJpy.value = totalJpy
  statsItems.value = Object.entries(itemMap)
    .map(([productName, quantity]) => ({ productName, quantity }))
    .sort((a, b) => b.quantity - a.quantity)

  statsLoading.value = false
}
</script>

<template>
  <div class="online-order">
    <!-- 活動列表 -->
    <template v-if="!currentEvent">
      <h3>通販訂單管理</h3>
      <table-component
        :headerRow="eventHeaderRow"
        :tableData="eventTableData"
        :isEdit="false"
        :isDelete="false"
        :rowClass="() => 'clickable-row'"
        @row-click="selectEvent($event)"
      >
        <template #col-_status="{ row }">
          <span class="status-badge" :style="STATUS_STYLE[row._status]">{{ row._status }}</span>
        </template>
      </table-component>
    </template>

    <!-- 訂單列表 -->
    <template v-else>
      <h3>
        <span class="back-link" @click="goBack">通販訂單管理</span>
        <span class="breadcrumb-sep"> / </span>
        {{ currentEvent.name }}
      </h3>

      <div class="pageHeader">
        <div class="btnBox">
          <div
            class="btn"
            v-if="isTableQueried && !currentEvent.isLocked"
            @click="isBatchModalOpen = true"
          >
            新增
          </div>
        </div>
        <div class="btnBox">
          <div class="btn btn-outline" v-if="isTableQueried" @click="openStats">總計</div>
        </div>
      </div>

      <table-component
        v-if="isTableQueried"
        :headerRow="orderHeaderRow"
        :tableData="orderData"
        :totalPages="totalPages"
        :currentPage="currentPage"
        :totalElements="totalElements"
        :pageSize="pageSize"
        :is-edit="!currentEvent.isLocked"
        :is-delete="!currentEvent.isLocked"
        @edit="orderFormModal?.editOrder($event)"
        @delete="orderFormModal?.deleteOrder($event)"
        @change-page="onChangePage"
        @change-size="onChangeSize"
      >
        <template #col-subtotalTwd="{ row }">
          {{ formatTwd(row.subtotalTwd) }}
        </template>
        <template #col-domesticShipping="{ row }">
          {{ formatTwd(row.domesticShipping) }}
        </template>
        <template #col-internationalShipping="{ row }">
          {{ formatTwd(row.internationalShipping) }}
        </template>
      </table-component>

      <!-- 總計彈窗 -->
      <modal-component
        v-if="isStatsOpen"
        name="總計"
        width="480px"
        :isShowCancelBtn="false"
        @confirm="isStatsOpen = false"
        @cancel="isStatsOpen = false"
      >
        <template #content>
          <div class="stats-modal">
            <div v-if="statsLoading" class="stats-loading">計算中…</div>
            <template v-else>
              <div class="stats-summary">
                <div class="stats-summary-item">
                  <span class="label">總數量</span>
                  <span class="value">{{ statsTotalQty.toLocaleString() }}</span>
                </div>
                <div class="stats-summary-item">
                  <span class="label">日幣總額</span>
                  <span class="value">{{ formatJpy(statsTotalJpy) }}</span>
                </div>
                <div class="stats-summary-item">
                  <span class="label">台幣總額</span>
                  <span class="value">{{ formatTwd(statsTotalTwd) }}</span>
                </div>
              </div>
              <table-component
                :headerRow="statsHeaderRow"
                :tableData="statsItems"
                :isEdit="false"
                :isDelete="false"
              />
            </template>
          </div>
        </template>
      </modal-component>

      <online-order-form-modal
        ref="orderFormModal"
        :eventId="currentEvent.id.toString()"
        :key="currentEvent.id"
        @confirmed="getOrderList"
      />
      <online-batch-order-form-modal
        v-if="isBatchModalOpen"
        :eventId="currentEvent.id.toString()"
        @confirmed="getOrderList"
        @close="isBatchModalOpen = false"
      />
    </template>
  </div>
</template>

<style scoped>
.online-order {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pageHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .btnBox {
    display: flex;
    gap: 1rem;
  }
}

.stats-modal {
  padding: 1rem 0.5rem 0.5rem;
}

.stats-loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-secondary);
}

.stats-summary {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1.25rem;
}

.stats-summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.875rem 0.5rem;
  gap: 0.3rem;

  & + & {
    border-left: 1px solid var(--color-border);
  }

  .label {
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #999;
  }

  .value {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1a1a2e;
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

.back-link {
  cursor: pointer;
  color: var(--color-primary);

  &:hover {
    text-decoration: underline;
  }
}

.breadcrumb-sep {
  color: #aaa;
  margin: 0 0.1rem;
}

:deep(.clickable-row) {
  cursor: pointer;

  &:hover .item-col {
    background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
  }
}
</style>
