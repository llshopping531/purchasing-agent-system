<script setup lang="ts">
/**
 * 訂單總覽頁面
 * 依活動（與可選通路）查詢訂單金額總計與分頁清單
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
import type { StatsOverviewItem } from '@/services/api/stats/stats-api-interfaces'

/** 目前選取的活動 ID */
const currentEventId = ref('')
/** 目前選取的通路 ID（空字串 = 未選取） */
const currentChannelId = ref('')
/** 是否顯示通路下拉 */
const isShowChannelSelect = ref(false)

/** 活動金額總計 */
const eventTotals = ref<{ totalJpy: number; totalTwd: number } | null>(null)
/** 通路金額總計 */
const channelTotals = ref<{ totalJpy: number; totalTwd: number } | null>(null)

/** 總覽表格資料 */
const tableData = ref<StatsOverviewItem[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const sortField = ref('id')
const sortDirection = ref<'ASC' | 'DESC'>('DESC')

const headerRow: HeaderRow[] = [
  { name: '顧客名稱', value: 'customerName', sort: 0, width: '120px', sortable: true },
  { name: '通路', value: 'channelName', sort: 6, width: '100px' },
  { name: '商品名稱', value: 'productName', sort: 1, width: '200px', sortable: true,mobileSpan:2 },
  { name: '數量', value: 'quantity', sort: 2, width: '70px', sortable: true },
  { name: '日幣小計', value: 'subtotalJpy', sort: 3, width: '110px', sortable: true },
  { name: '台幣小計', value: 'subtotalTwd', sort: 4, width: '110px', sortable: true },
  { name: '訂單狀態', value: 'orderStatusName', sort: 5, width: '100px' },
  { name: '採購者', value: 'purchaserName', sort: 7, width: '100px' },
]

function selectEvent(data: EventOption) {
  currentEventId.value = data.selectedData.value
  currentChannelId.value = ''
  isShowChannelSelect.value = true
  eventTotals.value = null
  channelTotals.value = null
  tableData.value = []
  currentPage.value = 1
  fetchAll()
}

function selectShop(data: ShopOption) {
  currentChannelId.value = data.selectedData.value
  channelTotals.value = null
  currentPage.value = 1
  fetchAll()
}

async function fetchAll() {
  if (!currentEventId.value) return
  await Promise.all([fetchTotals(), fetchChannelTotals(), fetchOverview()])
}

async function fetchTotals() {
  eventTotals.value = await statsApi.getStatsTotals({ eventId: Number(currentEventId.value) })
}

async function fetchChannelTotals() {
  if (!currentChannelId.value) {
    channelTotals.value = null
    return
  }
  channelTotals.value = await statsApi.getStatsChannelTotals({
    channelId: Number(currentChannelId.value),
  })
}

async function fetchOverview() {
  if (!currentEventId.value) return
  const res = await statsApi.getStatsOverview({
    eventId: Number(currentEventId.value),
    channelId: currentChannelId.value ? Number(currentChannelId.value) : undefined,
    page: currentPage.value - 1,
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
  currentPage.value = 1
  fetchOverview()
}

function onSort(field: string) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortField.value = field
    sortDirection.value = 'ASC'
  }
  currentPage.value = 1
  fetchOverview()
}

function formatJpy(val: number | null) {
  if (val == null) return '-'
  return `¥ ${val.toLocaleString()}`
}

function formatTwd(val: number | null) {
  if (val == null) return '—'
  return `NT$ ${val.toLocaleString()}`
}
</script>

<template>
  <div class="stats-view">
    <h3>訂單總覽</h3>

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

    <!-- 統計卡片 -->
    <div v-if="eventTotals" class="totals-section">
      <!-- 活動總計 -->
      <div class="totals-group">
        <div class="totals-label">活動總計</div>
        <div class="totals-cards">
          <div class="stat-card jpy">
            <div class="stat-card-title">日幣總計</div>
            <div class="stat-card-value">{{ formatJpy(eventTotals.totalJpy) }}</div>
          </div>
          <div class="stat-card twd">
            <div class="stat-card-title">台幣總計</div>
            <div class="stat-card-value">{{ formatTwd(eventTotals.totalTwd) }}</div>
          </div>
        </div>
      </div>

      <!-- 通路總計（選取通路後顯示） -->
      <div v-if="channelTotals" class="totals-group">
        <div class="totals-label">通路總計</div>
        <div class="totals-cards">
          <div class="stat-card jpy secondary">
            <div class="stat-card-title">日幣總計</div>
            <div class="stat-card-value">{{ formatJpy(channelTotals.totalJpy) }}</div>
          </div>
          <div class="stat-card twd secondary">
            <div class="stat-card-title">台幣總計</div>
            <div class="stat-card-value">{{ formatTwd(channelTotals.totalTwd) }}</div>
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
        <template #col-subtotalJpy="{ row }">
          {{ formatJpy(row.subtotalJpy) }}
        </template>
        <template #col-subtotalTwd="{ row }">
          {{ formatTwd(row.subtotalTwd) }}
        </template>
        <template #col-orderStatusName="{ row }">
          <span class="status-badge">{{ row.orderStatusName }}</span>
        </template>
      </table-component>
    </div>

    <!-- 尚未選取活動提示 -->
    <div v-else class="empty-hint">請先選取活動以查詢訂單總覽</div>
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
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  .select-box {
    width: 45%;
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
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .totals-cards {
    flex-wrap: wrap;
    justify-content: space-between;
  }
}
</style>
