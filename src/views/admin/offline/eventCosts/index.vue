<script setup lang="ts">
/**
 * 活動成本管理頁面
 * 選取活動後顯示該活動的成本列表，支援新增／編輯／刪除
 */
import { ref } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import { eventCostsApi } from '@/services/api/offline/event-costs/event-costs-api'
import type { QueryEventCostItem } from '@/services/api/offline/event-costs/event-costs-api-interfaces'
import type { EventsResBase } from '@/services/api/offline/events/events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { formatTwd } from '@/utils/format'
import EventCostFormModal from './EventCostFormModal.vue'

const selectedEvent = ref<EventsResBase | null>(null)
const costList = ref<QueryEventCostItem[]>([])
const totalFee = ref(0)

const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)

const eventCostFormModal = ref<InstanceType<typeof EventCostFormModal>>()

const headerRow: HeaderRow[] = [
  { name: '採購者', value: 'purchaserName', sort: 0, width: '100px' },
  { name: '費用項目', value: 'item', sort: 0, mobileSpan: 3 },
  { name: '金額', value: 'fee', sort: 0, },
  { name: '建立時間', value: 'createTime', sort: 0, width: '160px' },
]

async function onEventSelect(opt: SelectOption<EventsResBase | null>) {
  if (!opt.value) return
  selectedEvent.value = opt.value
  currentPage.value = 0
  await loadCosts()
}

async function loadCosts() {
  if (!selectedEvent.value) return
  const [list, total] = await Promise.all([
    eventCostsApi.getEventCosts({ eventId: selectedEvent.value.id }),
    eventCostsApi.getEventCostsTotal({ eventId: selectedEvent.value.id }),
  ])
  costList.value = list
  totalFee.value = total
  totalElements.value = list.length
  totalPages.value = Math.max(1, Math.ceil(list.length / pageSize.value))
}

function onChangePage(page: number) {
  currentPage.value = page
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  totalPages.value = Math.max(1, Math.ceil(costList.value.length / size))
}
</script>

<template>
  <div class="event-costs-view">
    <h3>活動成本管理</h3>

    <!-- 篩選列 -->
    <div class="filter-bar">
      <div class="select-box">
        <event-select-component @selectOption="onEventSelect" />
      </div>
      <button
        v-if="selectedEvent"
        class="btn"
        @click="eventCostFormModal?.createCost(selectedEvent!.id)"
      >
        新增成本
      </button>
    </div>

    <!-- 成本總計卡片 -->
    <div v-if="selectedEvent" class="summary-section">
      <div class="summary-label">成本總計</div>
      <div class="summary-cards">
        <div class="stat-card">
          <div class="stat-card-title">費用筆數</div>
          <div class="stat-card-value">{{ costList.length }}</div>
        </div>
        <div class="stat-card total">
          <div class="stat-card-title">成本合計</div>
          <div class="stat-card-value">{{ formatTwd(totalFee) }}</div>
        </div>
      </div>
    </div>
    <div class="cost-note">
      <div class="cost-note-title">費用基準參考</div>
      <ul class="cost-note-list">
        <li>機票來回：上限 1萬2（含行李），行李加購可實報實銷</li>
        <li>飯店：一晚 $2,000／晚（不計室友）</li>
        <li>展場：實報實銷</li>
        <li>咖啡廳：低消；若餐點特典有售出，可實報實銷</li>
        <li>日境內交通：¥1,000／天</li>
        <li>日額外交通：實報實銷</li>
        <li>餐費：¥2,000／天</li>
      </ul>
    </div>

    <!-- 成本列表 -->
    <div v-if="selectedEvent" class="table-section">
      <table-component
        :headerRow="headerRow"
        :tableData="costList"
        :totalPages="totalPages"
        :currentPage="currentPage"
        :totalElements="totalElements"
        :pageSize="pageSize"
        @edit="eventCostFormModal?.editCost($event)"
        @delete="eventCostFormModal?.deleteCost($event)"
        @change-page="onChangePage"
        @change-size="onChangeSize"
      >
        <template #col-fee="{ row }">
          <span class="fee-value">{{ formatTwd(row.fee) }}</span>
        </template>
        <template #col-createTime="{ row }">
          {{ row.createTime?.slice(0, 10) }}
        </template>
      </table-component>
    </div>

    <div v-else class="empty-hint">請先選取活動以查詢成本資料</div>

    <event-cost-form-modal ref="eventCostFormModal" @confirmed="loadCosts" />
  </div>
</template>

<style scoped>
.event-costs-view {
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

  &.total {
    border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    background: color-mix(in srgb, var(--color-primary) 5%, var(--color-surface));
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

/* ── 表格 ── */
.table-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fee-value {
  font-weight: 600;
  color: var(--color-primary);
}

/* ── 費用基準參考 ── */
.cost-note {
  background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
  border: 1.5px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius-lg);
  padding: 0.85rem 1.1rem;
}

.cost-note-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

.cost-note-list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  li {
    font-size: 0.82rem;
    color: var(--color-text-secondary);
    line-height: 1.5;
  }
}

/* ── 空狀態 ── */
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
