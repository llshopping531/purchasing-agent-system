<script setup lang="ts">
/**
 * 分潤查詢頁面
 * 依活動（與可選通路）查詢分潤總計與分潤明細列表
 */
import { ref } from 'vue'
import EventSelectComponent, {
  type EventOption,
} from '@/components/inputs/selects/EventSelectComponent.vue'
import ShopSelectComponent, {
  type ShopOption,
} from '@/components/inputs/selects/ShopSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { statsApi } from '@/services/api/stats/stats-api'
import type {
  ProfitShareItem,
  QueryStatsProfitShareSummaryRes,
} from '@/services/api/stats/stats-api-interfaces'

const currentEventId = ref('')
const currentChannelId = ref('')
const isShowChannelSelect = ref(false)

const summary = ref<QueryStatsProfitShareSummaryRes | null>(null)
const tableData = ref<ProfitShareItem[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const sortField = ref('id')
const sortDirection = ref<'ASC' | 'DESC'>('DESC')

const headerRow: HeaderRow[] = [
  { name: '顧客名稱', value: 'customerName', sort: 0, width: '120px', sortable: true },
  { name: '通路', value: 'channelName', sort: 1, width: '100px' },
  { name: '商品名稱', value: 'productName', sort: 2, width: '200px', sortable: true, mobileSpan: 2 },
  { name: '數量', value: 'quantity', sort: 3, width: '70px', sortable: true },
  { name: '台幣小計', value: 'subtotalTwd', sort: 4, width: '110px', sortable: true },
  { name: '獲利', value: 'profit', sort: 5, width: '110px', sortable: true },
  { name: '分潤金額', value: 'profitShare', sort: 6, width: '110px', sortable: true },
  { name: '訂單狀態', value: 'orderStatusName', sort: 7, width: '100px' },
  { name: '採購者', value: 'purchaserName', sort: 8, width: '100px' },
]

function selectEvent(data: EventOption) {
  currentEventId.value = data.selectedData.value
  currentChannelId.value = ''
  isShowChannelSelect.value = true
  summary.value = null
  tableData.value = []
  currentPage.value = 0
  fetchAll()
}

function selectShop(data: ShopOption) {
  currentChannelId.value = data.selectedData.value
  summary.value = null
  currentPage.value = 0
  fetchAll()
}

async function fetchAll() {
  if (!currentEventId.value) return
  await Promise.all([fetchSummary(), fetchDetail()])
}

async function fetchSummary() {
  summary.value = await statsApi.getStatsProfitShareSummary({
    eventId: Number(currentEventId.value),
    channelId: currentChannelId.value ? Number(currentChannelId.value) : undefined,
  })
}

async function fetchDetail() {
  const res = await statsApi.getStatsProfitShare({
    eventId: Number(currentEventId.value),
    channelId: currentChannelId.value ? Number(currentChannelId.value) : undefined,
    page: currentPage.value,
    size: pageSize.value,
    sort: sortField.value,
    direction: sortDirection.value,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
}

function onChangePage(page: number) {
  currentPage.value = page
  fetchDetail()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  fetchDetail()
}

function onSort(field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortField.value = field
    sortDirection.value = 'ASC'
  }
  currentPage.value = 0
  fetchDetail()
}

function formatTwd(val: number | null) {
  if (val == null) return '—'
  return `NT$ ${val.toLocaleString()}`
}

function formatPercent(val: number | null) {
  if (val == null) return '—'
  return `${(val * 100).toFixed(1)}%`
}
</script>

<template>
  <div class="profit-share-view">
    <h3>分潤查詢</h3>

    <!-- 篩選列 -->
    <div class="filter-bar">
      <div class="select-box">
        <event-select-component @selectOption="selectEvent" />
      </div>
      <div class="select-box">
        <shop-select-component
          v-if="isShowChannelSelect"
          :key="currentEventId"
          :eventId="currentEventId"
          :isShowAll="true"
          @selectOption="selectShop"
        />
      </div>
    </div>

    <!-- 分潤總計卡片 -->
    <div v-if="summary" class="summary-section">
      <div class="summary-label">分潤總計</div>
      <div class="summary-cards">
        <div class="stat-card">
          <div class="stat-card-title">台幣總額</div>
          <div class="stat-card-value">{{ formatTwd(summary.totalTwd) }}</div>
        </div>
        <div class="stat-card profit">
          <div class="stat-card-title">獲利金額</div>
          <div class="stat-card-value">{{ formatTwd(summary.totalProfit) }}</div>
        </div>
        <div class="stat-card share">
          <div class="stat-card-title">分潤金額</div>
          <div class="stat-card-value">{{ formatTwd(summary.totalProfitShare) }}</div>
        </div>
        <div class="stat-card ratio">
          <div class="stat-card-title">分潤比率</div>
          <div class="stat-card-value">{{ formatPercent(summary.ratio) }}</div>
        </div>
        <div class="stat-card ratio">
          <div class="stat-card-title">成本比率</div>
          <div class="stat-card-value">{{ formatPercent(summary.costRate) }}</div>
        </div>
      </div>
    </div>

    <!-- 分潤明細表格 -->
    <div v-if="currentEventId" class="table-section">
      <table-component
        :tableData="tableData"
        :headerRow="headerRow"
        :isDelete="false"
        :isEdit="false"
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
        <template #col-subtotalTwd="{ row }">
          {{ formatTwd(row.subtotalTwd) }}
        </template>
        <template #col-profit="{ row }">
          {{ formatTwd(row.profit) }}
        </template>
        <template #col-profitShare="{ row }">
          {{ formatTwd(row.profitShare) }}
        </template>
        <template #col-orderStatusName="{ row }">
          <span class="status-badge">{{ row.orderStatusName }}</span>
        </template>
      </table-component>
    </div>

    <div v-else class="empty-hint">請先選取活動以查詢分潤資料</div>
  </div>
</template>

<style scoped>
.profit-share-view {
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

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;

  .select-box {
    width: 45%;
  }
}

/* ── 總計區塊 ── */
.summary-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding-left: 2px;
}

.summary-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-lg);
  border: 1.5px solid var(--color-border);
  min-width: 140px;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: var(--shadow-md);
  }

  &.profit {
    border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));
  }

  &.share {
    border-color: color-mix(in srgb, var(--color-secondary) 40%, transparent);
    background: color-mix(in srgb, var(--color-secondary) 7%, var(--color-surface));
  }

  &.ratio {
    border-color: color-mix(in srgb, var(--color-secondary-dark) 30%, transparent);
    background: color-mix(in srgb, var(--color-secondary-dark) 5%, var(--color-surface));
  }
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

.status-badge {
  display: inline-block;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-xl);
  font-size: 0.75rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
  color: var(--color-secondary-dark);
}

.empty-hint {
  text-align: center;
  padding: 3rem 0;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .filter-bar .select-box {
    width: 100%;
  }

  .summary-cards {
    gap: 0.5rem;
  }

  .stat-card {
    min-width: calc(50% - 0.375rem);
    flex: 1;
  }
}
</style>
