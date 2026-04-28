<script setup lang="ts">
/**
 * 訂單總覽頁面
 * 依活動（與可選通路）查詢訂單金額總計與分頁清單
 */
import { onMounted, ref } from 'vue'
import type { QueryBonusRequirementStatsRes, BonusRequirementDetail } from '@/services/api/offline/stats/stats-api-interfaces'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/selects/ShopSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { statsApi } from '@/services/api/offline/stats/stats-api'
import type { StatsOverviewItem } from '@/services/api/offline/stats/stats-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import type { EventsResBase } from '@/services/api/offline/events/events-api-interfaces'
import type { QueryChannelsAllRes } from '@/services/api/offline/channels/channels-api-interfaces'
import { useSearchStore } from '@/stores/search'
import { formatTwd, formatJpy } from '@/utils/format'
import OrderStatusSelectComponent from '@/components/inputs/selects/OrderStatusSelectComponent.vue'
import CustomerSelectComponent from '@/components/inputs/selects/CustomerSelectComponent.vue'
import ProductSelectComponent from '@/components/inputs/selects/ProductSelectComponent.vue'
import PurchaserSelectComponent from '@/components/inputs/selects/PurchaserSelectComponent.vue'
import { isInactiveOrder } from '@/utils/order'
import ModalComponent from '@/components/ModalComponent.vue'

const searchStore = useSearchStore()

/** 目前選取的活動 ID */
const currentEventId = ref('')
/** 目前選取的通路 ID（空字串 = 未選取） */
const currentChannelId = ref('')
/** 是否顯示通路下拉 */
const isShowChannelSelect = ref(false)
/** 是否展開篩選列 */
const isFilterExpanded = ref(false)

/** 當前篩選條件下的金額總計 */
const currentTotals = ref<{ totalJpy: number; totalTwd: number } | null>(null)

/** 通路滿額需求統計 */
const channelBonusData = ref<QueryBonusRequirementStatsRes | null>(null)
/** 特典明細彈窗 */
const bonusModalDetails = ref<BonusRequirementDetail[] | null>(null)

/** 總覽表格資料 */
const tableData = ref<StatsOverviewItem[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const sortField = ref('id')
const sortDirection = ref<'ASC' | 'DESC'>('DESC')
const currentStatus = ref<string | undefined>(undefined)
const currentCustomer = ref<number | undefined>(undefined)
const currentProduct = ref<number | undefined>(undefined)
const currentPurchaser = ref<string | undefined>(undefined)

const headerRow: HeaderRow[] = [
  { name: '顧客名稱', value: 'customerName', sort: 0, width: '120px', sortable: true },
  { name: '通路', value: 'channelName', sort: 6, width: '150px' },
  {
    name: '商品名稱',
    value: 'productName',
    sort: 1,
    sortable: true,
    mobileSpan: 2,
  },
  { name: '數量', value: 'quantity', sort: 2, width: '70px' },
  { name: '匯率', value: 'exchangeRate', sort: 3, width: '70px' },
  { name: '日幣小計', value: 'displaySubtotalJpy', sort: 4, width: '110px', sortable: true },
  { name: '台幣小計', value: 'displaySubtotalTwd', sort: 5, width: '110px', sortable: true },
  { name: '訂單狀態', value: 'orderStatusName', sort: 6, width: '100px' },
  { name: '備註', value: 'note', sort: 7 },
  { name: '採購者', value: 'purchaserName', sort: 8, width: '100px' },
]

onMounted(() => {
  const prev = searchStore.getSearchStore('STATS')
  if (prev?.eventId) {
    currentEventId.value = prev.eventId
    currentChannelId.value = prev.channelId ?? ''
    isShowChannelSelect.value = true
    fetchAll()
  }
})

function selectEvent(data: SelectOption<EventsResBase | null>) {
  currentEventId.value = data.value?.id.toString() ?? ''
  currentChannelId.value = ''
  currentCustomer.value = undefined
  currentProduct.value = undefined
  currentPurchaser.value = undefined
  currentStatus.value = undefined
  isShowChannelSelect.value = true
  currentTotals.value = null
  tableData.value = []
  currentPage.value = 0
  searchStore.setSearchStore({
    name: 'STATS',
    condition: { eventId: currentEventId.value, channelId: null },
  })
  fetchAll()
}

function selectShop(data: SelectOption<QueryChannelsAllRes | null>) {
  currentChannelId.value = data.value?.id.toString() ?? ''
  currentPurchaser.value = undefined
  currentPage.value = 0
  searchStore.setSearchStore({
    name: 'STATS',
    condition: { eventId: currentEventId.value, channelId: currentChannelId.value || null },
  })
  fetchAll()
}

async function fetchAll() {
  if (!currentEventId.value) return
  await Promise.all([fetchCurrentTotals(), fetchOverview(), fetchChannelBonusList()])
}

async function fetchChannelBonusList() {
  if (!currentEventId.value || !currentChannelId.value) {
    channelBonusData.value = null
    return
  }
  channelBonusData.value = await statsApi.getBonusRequirementStats({
    eventId: currentEventId.value,
    channelId: currentChannelId.value,
  })
}

async function fetchCurrentTotals() {
  if (!currentEventId.value) return
  currentTotals.value = await statsApi.getStatsTotalsWithFilters({
    eventId: Number(currentEventId.value),
    channelId: currentChannelId.value ? Number(currentChannelId.value) : undefined,
    customerId: currentCustomer.value?.toString(),
    productId: currentProduct.value?.toString(),
    orderStatus: currentStatus.value,
    purchaser: currentPurchaser.value,
  })
}

function updateOrderStatus(status: string | undefined) {
  currentStatus.value = status
  fetchOverview()
  fetchCurrentTotals()
}

function updateCustomer(customer: number | undefined) {
  currentCustomer.value = customer
  currentPage.value = 0
  fetchOverview()
  fetchCurrentTotals()
}

function updateProduct(product: number | undefined) {
  currentProduct.value = product
  currentPage.value = 0
  fetchOverview()
  fetchCurrentTotals()
}

function updatePurchaser(purchaser: string | undefined) {
  currentPurchaser.value = purchaser
  currentPage.value = 0
  fetchOverview()
  fetchCurrentTotals()
}

async function fetchOverview() {
  if (!currentEventId.value) return
  const res = await statsApi.getStatsOverview({
    eventId: Number(currentEventId.value),
    channelId: currentChannelId.value ? Number(currentChannelId.value) : undefined,
    orderStatus: currentStatus.value,
    customerId: currentCustomer.value,
    productId: currentProduct.value,
    purchaser: currentPurchaser.value,
    page: currentPage.value,
    size: pageSize.value,
    sort: sortField.value,
    direction: sortDirection.value,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
  console.log(res.content)
}

function onChangePage(page: number) {
  currentPage.value = page
  fetchOverview()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  fetchOverview()
}

function onSort(field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortField.value = field
    sortDirection.value = 'ASC'
  }
  currentPage.value = 0
  fetchOverview()
}
</script>

<template>
  <div class="stats-view">
    <h3>訂單總覽</h3>

    <!-- 篩選列 -->
    <div class="filter-bar">
      <div class="filter-bar-row">
        <div class="select-box">
          <event-select-component :initialId="currentEventId" @selectOption="selectEvent" />
        </div>
        <div class="select-box">
          <shop-select-component
            v-if="isShowChannelSelect"
            :key="currentEventId"
            :eventId="currentEventId"
            :initialId="currentChannelId || undefined"
            :isShowAll="true"
            @selectOption="selectShop"
          />
        </div>
        <button
          class="filter-toggle-btn"
          @click="isFilterExpanded = !isFilterExpanded"
          v-if="currentEventId"
        >
          {{ isFilterExpanded ? '收合篩選' : '更多篩選' }}
        </button>
      </div>
      <template v-if="currentEventId && isFilterExpanded">
        <div class="filter-bar-row">
          <div class="select-box">
            <order-status-select-component
              :defaultValue="currentStatus"
              @selectOption="updateOrderStatus($event.value)"
              :isDisplayAll="true"
            ></order-status-select-component>
          </div>
          <div class="select-box">
            <customer-select-component
              title="顧客"
              :eventId="currentEventId"
              :channelId="currentChannelId"
              :isDisplayAll="true"
              @selectOption="updateCustomer($event.value?.id)"
            ></customer-select-component>
          </div>
          <div class="select-box">
            <product-select-component
              :eventId="currentEventId"
              :channelId="currentChannelId"
              :isDisplayAll="true"
              @onSelectProduct="updateProduct($event.value?.id)"
            />
          </div>
          <div class="select-box">
            <purchaser-select-component
              :isDisplayAll="true"
              @selectOption="updatePurchaser($event.value)"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- 統計卡片 -->
    <div v-if="currentTotals" class="totals-section">
      <div class="totals-group">
        <div class="totals-label">總計</div>
        <div class="totals-cards">
          <div class="stat-card jpy">
            <div class="stat-card-title">日幣總計</div>
            <div class="stat-card-value">{{ formatJpy(currentTotals.totalJpy) }}</div>
          </div>
          <div class="stat-card twd">
            <div class="stat-card-title">台幣總計</div>
            <div class="stat-card-value">{{ formatTwd(currentTotals.totalTwd) }}</div>
          </div>
          <div
            class="stat-card jpy secondary clickable"
            v-if="channelBonusData"
            @click="bonusModalDetails = channelBonusData.details"
          >
            <div class="stat-card-title">特典數量 <span class="click-hint">點擊查看明細</span></div>
            <div class="stat-card-value">{{
              currentCustomer
                ? (channelBonusData.details.find(d => d.customerId === currentCustomer)?.bonusCount ?? 0)
                : channelBonusData.bonusRequirement
            }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 總覽表格 -->
    <div v-if="currentEventId" class="table-section">
      <table-component
        :tableData="tableData"
        :headerRow="headerRow"
        :isDelete="false"
        :isEdit="false"
        :rowClass="(row) => (isInactiveOrder(row.orderStatusName) ? 'inactive' : '')"
        :totalPages="totalPages"
        :currentPage="currentPage"
        :totalElements="totalElements"
        :pageSize="pageSize"
        :sortField="sortField"
        :sortDirection="sortDirection"
        @changePage="onChangePage"
        @changeSize="onChangeSize"
        @sort="onSort"
      >
        <template #col-displaySubtotalTwd="{ row }">
          <span
            v-if="
              (!row.subtotalTwd || String(row.subtotalTwd) === '-') &&
              !isInactiveOrder(row.orderStatusName)
            "
            class="warn-icon"
            title="台幣小計為空"
            >!</span
          >
          {{ formatTwd(row.displaySubtotalTwd) }}
        </template>
        <template #col-displaySubtotalJpy="{ row }">
          {{ formatJpy(row.displaySubtotalJpy) }}
        </template>
        <template #col-note="{ row }">
          <span v-show="row.nonBonusTarget"> 不計入贈品</span>
          <span v-show="row.isFixedRate"> 固定匯率</span>
          <span v-show="row.nonCutTarget"> 不計入分潤</span>
          {{ row.note }}
        </template>
        <!-- <template #col-subtotalTwd="{ row }">
          <span
            :class="{ 'out-of-stock': isInactive(row) }"
            class="row-cell"
            @click="toggleMark(row.id)"
          >
            <span
              v-if="(!row.subtotalTwd || String(row.subtotalTwd) === '-') && !isInactive(row)"
              class="warn-icon"
              title="台幣小計為空"
              >!</span
            >
            {{ row.subtotalTwd }}
          </span>
        </template> -->
      </table-component>
    </div>

    <!-- 尚未選取活動提示 -->
    <div v-else class="empty-hint">請先選取活動以查詢訂單總覽</div>

    <!-- 特典明細彈窗 -->
    <modal-component
      v-if="bonusModalDetails"
      name="特典明細"
      width="360px"
      @confirm="bonusModalDetails = null"
      @cancel="bonusModalDetails = null"
    >
      <template #content>
        <table class="bonus-detail-table">
          <thead>
            <tr>
              <th>顧客名稱</th>
              <th>特典數量</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in bonusModalDetails" :key="d.customerId">
              <td>{{ d.customerName }}</td>
              <td class="bonus-count">{{ d.bonusCount }}</td>
            </tr>
          </tbody>
        </table>
      </template>
    </modal-component>
  </div>
</template>

<style scoped>
.stats-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

/* ── 篩選列 ── */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-bar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;

  .select-box {
    width: 45%;
  }
}

.filter-toggle-btn {
  align-self: flex-end;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

/* ── 統計區塊 ── */
.totals-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.totals-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.totals-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding-left: 2px;
}

.totals-cards {
  display: flex;
  gap: 0.75rem;
}

.stat-card-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.stat-card-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: 0.02em;
}

/* ── 通路滿額 ── */
.bonus-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bonus-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.bonus-card {
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  box-shadow: var(--shadow-sm);

  &.reached {
    border-color: color-mix(in srgb, #16a34a 40%, transparent);
    background: color-mix(in srgb, #16a34a 4%, var(--color-surface));
  }
}

.bonus-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.bonus-channel {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

.bonus-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  background: color-mix(in srgb, #16a34a 15%, transparent);
  color: #16a34a;
}

.bonus-progress-wrap {
  height: 6px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
}

.bonus-progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: 99px;
  transition: width 0.4s ease;

  .reached & {
    background: #16a34a;
  }
}

.bonus-meta {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

/* ── 表格區 ── */
.table-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.status-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-xl);
  font-size: 0.75rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  color: var(--color-primary-dark);
}

.warn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d97706;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
  margin-right: 0.25rem;
}

.clickable {
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.1s;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}

.click-hint {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-left: 4px;
}


.bonus-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th {
    text-align: left;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    padding: 0.4rem 0.5rem;
    border-bottom: 1.5px solid var(--color-border);
  }

  td {
    padding: 0.55rem 0.5rem;
    color: var(--color-text);
    border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.bonus-count {
  font-weight: 700;
  color: var(--color-primary-dark, var(--color-primary));
  font-size: 1rem;
}

/* ── 空狀態 ── */
.empty-hint {
  text-align: center;
  padding: 3rem 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

@media (min-width: 768px) {
  .stat-card {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.85rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1.5px solid transparent;
    min-width: 160px;
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.15s;

    &:hover {
      box-shadow: var(--shadow-md);
    }

    &.jpy {
      border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
      background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));
    }

    &.twd {
      border-color: color-mix(in srgb, var(--color-primary-dark) 25%, transparent);
      background: color-mix(in srgb, var(--color-primary-dark) 4%, var(--color-surface));
    }

    &.secondary.jpy {
      border-color: color-mix(in srgb, var(--color-secondary) 35%, transparent);
      background: color-mix(in srgb, var(--color-secondary) 6%, var(--color-surface));
    }

    &.secondary.twd {
      border-color: color-mix(in srgb, var(--color-secondary-dark) 30%, transparent);
      background: color-mix(in srgb, var(--color-secondary-dark) 5%, var(--color-surface));
    }

    &.filtered.jpy {
      border-color: color-mix(in srgb, #0891b2 30%, transparent);
      background: color-mix(in srgb, #0891b2 5%, var(--color-surface));
    }

    &.filtered.twd {
      border-color: color-mix(in srgb, #0e7490 25%, transparent);
      background: color-mix(in srgb, #0e7490 4%, var(--color-surface));
    }
  }
}

@media (max-width: 768px) {
  .totals-section {
    flex-direction: column;
    gap: 1rem;
  }
  .stats-view {
    gap: 1rem;
  }
  .totals-label {
    border: 1.5px solid var(--color-primary);
    color: var(--color-primary);
    background: var(--color-primary-muted);
    padding: 0.25rem 0.6rem;
    border-radius: var(--radius-xl);
    width: fit-content;
  }

  .stat-card {
    min-width: 0;
    gap: 0.25rem;
    align-items: center;
  }

  .totals-cards {
    flex-wrap: wrap;
    gap: 2rem;
  }
}
</style>
