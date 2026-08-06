<script setup lang="ts">
/**
 * 包貨清單（場販 + 通販合併）
 * 頂部選擇場販活動（單選）與通販活動（多選），左側顯示合併客戶清單，
 * 右側分區顯示該客戶的場販訂單與通販訂單
 */
import { ref, computed } from 'vue'
import { formatTwd, formatJpy } from '@/utils/format'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import { packingListApi } from '@/services/api/offline/packing-list/packing-list-api'
import { onlinePackingListApi } from '@/services/api/online/packing-list/online-packing-list-api'
import { onlineEventApi } from '@/services/api/online/online-events/online-events-api'
import type { PackingListCustomer, CustomerOrder } from '@/services/api/offline/packing-list/packing-list-api-interfaces'
import type { OnlinePackingCustomer, OnlinePackingOrder } from '@/services/api/online/packing-list/online-packing-list-api-interfaces'
import type { OnlineEventsResBase } from '@/services/api/online/online-events/online-events-api-interfaces'
import type { EventsResBase } from '@/services/api/offline/events/events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { isInactiveOrder } from '@/utils/order'

// ── 活動選取 ───────────────────────────────────────────────────

const selectedOfflineEvent = ref<EventsResBase | null>(null)
const selectedOnlineEvents = ref<SelectOption<OnlineEventsResBase>[]>([])
const allOnlineEvents = ref<OnlineEventsResBase[]>([])

const onlineEventOptions = computed<SelectOption<OnlineEventsResBase>[]>(() =>
  allOnlineEvents.value.map((e) => ({ name: e.name, value: e })),
)

const selectedOnlineEventIds = computed(() => selectedOnlineEvents.value.map((e) => e.value.id))

onlineEventApi.getAllOnlineEvents().then((res) => {
  allOnlineEvents.value = res
})

// ── 客戶清單（合併去重） ────────────────────────────────────────

type MergedCustomer = { id: number; name: string }

const offlineCustomers = ref<PackingListCustomer[]>([])
const onlineCustomers = ref<OnlinePackingCustomer[]>([])
const isLoadingCustomers = ref(false)

const mergedCustomers = computed<MergedCustomer[]>(() => {
  const map = new Map<number, MergedCustomer>()
  for (const c of offlineCustomers.value) map.set(c.id, { id: c.id, name: c.name })
  for (const c of onlineCustomers.value) map.set(c.id, { id: c.id, name: c.name })
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
})

const searchKeyword = ref('')
const filteredCustomers = computed(() => {
  const kw = searchKeyword.value.toLowerCase()
  return mergedCustomers.value.filter((c) => c.name.toLowerCase().includes(kw))
})

const isCustomerPanelOpen = ref(false)

async function reloadCustomers() {
  isLoadingCustomers.value = true
  selectedCustomer.value = null
  offlineOrders.value = []
  onlineOrders.value = []
  try {
    const tasks: Promise<void>[] = []
    if (selectedOfflineEvent.value) {
      tasks.push(
        packingListApi
          .getCustomers({ eventId: selectedOfflineEvent.value.id })
          .then((res) => { offlineCustomers.value = res }),
      )
    } else {
      offlineCustomers.value = []
    }
    if (selectedOnlineEventIds.value.length > 0) {
      tasks.push(
        onlinePackingListApi
          .getCustomers({ eventIds: selectedOnlineEventIds.value })
          .then((res) => { onlineCustomers.value = res }),
      )
    } else {
      onlineCustomers.value = []
    }
    await Promise.all(tasks)
  } finally {
    isLoadingCustomers.value = false
  }
}

async function onOfflineEventSelect(data: SelectOption<EventsResBase | null>) {
  if (!data.value) return
  selectedOfflineEvent.value = data.value
  await reloadCustomers()
}

async function onOnlineEventsSelect(opts: SelectOption<OnlineEventsResBase>[]) {
  selectedOnlineEvents.value = opts
  await reloadCustomers()
}

// ── 客戶訂單 ──────────────────────────────────────────────────

const selectedCustomer = ref<MergedCustomer | null>(null)
const offlineOrders = ref<CustomerOrder[]>([])
const onlineOrders = ref<OnlinePackingOrder[]>([])
const isLoadingOrders = ref(false)

const filterProduct = ref('')

const filteredOfflineOrders = computed(() =>
  offlineOrders.value.filter(
    (o) => !filterProduct.value || o.productName.includes(filterProduct.value),
  ),
)
const filteredOnlineOrders = computed(() =>
  onlineOrders.value.filter(
    (o) => !filterProduct.value || o.productName.includes(filterProduct.value),
  ),
)

const offlineTotalTwd = computed(() =>
  offlineOrders.value
    .filter((o) => o.orderStatusName === '已購買')
    .reduce((s, o) => s + o.subtotalTwd, 0),
)
const onlineTotalTwd = computed(() =>
  onlineOrders.value.reduce((s, o) => s + o.subtotalTwd, 0),
)
const grandTotal = computed(() => offlineTotalTwd.value + onlineTotalTwd.value)

async function selectCustomer(customer: MergedCustomer) {
  selectedCustomer.value = customer
  filterProduct.value = ''
  isCustomerPanelOpen.value = false
  isLoadingOrders.value = true
  try {
    const tasks: Promise<void>[] = []
    if (selectedOfflineEvent.value) {
      tasks.push(
        packingListApi
          .getCustomerOrders({ customerId: customer.id, eventId: selectedOfflineEvent.value.id })
          .then((res) => { offlineOrders.value = res }),
      )
    } else {
      offlineOrders.value = []
    }
    if (selectedOnlineEventIds.value.length > 0) {
      tasks.push(
        onlinePackingListApi
          .getCustomerOrders({ customerId: customer.id, eventIds: selectedOnlineEventIds.value })
          .then((res) => { onlineOrders.value = res }),
      )
    } else {
      onlineOrders.value = []
    }
    await Promise.all(tasks)
  } finally {
    isLoadingOrders.value = false
  }
}

// ── 表頭定義 ──────────────────────────────────────────────────

const offlineHeaders: HeaderRow[] = [
  { name: '通路', value: 'channelName', sort: 0, width: '120px' },
  { name: '商品名稱', value: 'productName', sort: 1 },
  { name: '數量', value: 'quantity', sort: 2, width: '60px' },
  { name: '台幣小計', value: 'subtotalTwdFmt', sort: 3, width: '100px' },
  { name: '狀態', value: 'orderStatusName', sort: 4, width: '90px' },
  { name: '備註', value: 'note', sort: 5, width: '100px' },
]

const onlineHeaders: HeaderRow[] = [
  { name: '活動', value: 'officialOrderName', sort: 0, width: '140px' },
  { name: '商品名稱', value: 'productName', sort: 1 },
  { name: '數量', value: 'quantity', sort: 2, width: '60px' },
  { name: '台幣小計', value: 'subtotalTwdFmt', sort: 3, width: '100px' },
  { name: '國內運費', value: 'domesticShippingFmt', sort: 4, width: '100px' },
  { name: '備註', value: 'note', sort: 5, width: '100px' },
]

const offlineTableData = computed(() =>
  filteredOfflineOrders.value.map((o) => ({
    ...o,
    subtotalTwdFmt: formatTwd(o.subtotalTwd),
  })),
)

const onlineTableData = computed(() =>
  filteredOnlineOrders.value.map((o) => ({
    ...o,
    subtotalTwdFmt: formatTwd(o.subtotalTwd),
    domesticShippingFmt: o.domesticShipping ? formatTwd(o.domesticShipping) : '-',
  })),
)

const hasAnySelection = computed(
  () => selectedOfflineEvent.value !== null || selectedOnlineEventIds.value.length > 0,
)
</script>

<template>
  <div class="packing-page">
    <h2 class="page-title">包貨清單</h2>

    <!-- 活動選取列 -->
    <div class="selector-row">
      <div class="selector-item">
        <div class="selector-label">場販活動</div>
        <event-select-component @selectOption="onOfflineEventSelect" />
      </div>
      <div class="selector-item selector-item--grow">
        <div class="selector-label">通販活動（可多選）</div>
        <select-component
          label=""
          :isDisplayLable="false"
          :optionList="onlineEventOptions"
          :defaultValue="undefined"
          :multiple="true"
          :selectedValues="selectedOnlineEvents"
          @selectOptions="onOnlineEventsSelect"
        />
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-if="!hasAnySelection" class="empty-state">
      <div class="empty-icon">📦</div>
      <div class="empty-text">請選取場販活動或通販活動以載入客戶清單</div>
    </div>

    <div v-else class="content">
      <!-- 手機版遮罩 -->
      <transition name="fade">
        <div v-if="isCustomerPanelOpen" class="mobile-backdrop" @click="isCustomerPanelOpen = false" />
      </transition>

      <!-- 左：客戶清單 -->
      <div class="customer-panel" :class="{ 'mobile-open': isCustomerPanelOpen }">
        <div class="panel-header">
          <span class="panel-title">客戶清單</span>
          <span class="count">{{ filteredCustomers.length }} 人</span>
        </div>
        <input v-model="searchKeyword" class="search-input" placeholder="搜尋客戶..." />
        <div v-if="isLoadingCustomers" class="empty">載入中…</div>
        <div v-else-if="mergedCustomers.length === 0" class="empty">尚無訂單資料</div>
        <div v-else-if="filteredCustomers.length === 0" class="empty">無符合的客戶</div>
        <ul v-else class="customer-list">
          <li
            v-for="c in filteredCustomers"
            :key="c.id"
            class="customer-item"
            :class="{ selected: selectedCustomer?.id === c.id }"
            @click="selectCustomer(c)"
          >
            {{ c.name }}
          </li>
        </ul>
      </div>

      <!-- 右：訂單明細 -->
      <div class="order-panel">
        <button class="mobile-customer-btn" @click="isCustomerPanelOpen = true">
          {{ selectedCustomer ? selectedCustomer.name : '選擇客戶' }}
        </button>

        <template v-if="selectedCustomer">
          <!-- 標題列 + 總金額 + 篩選 -->
          <div class="order-toolbar">
            <h4>{{ selectedCustomer.name }} 的訂單明細</h4>
            <div class="total-badge">
              <span class="total-label">合計</span>
              <span class="total-value">{{ formatTwd(grandTotal) }}</span>
            </div>
          </div>
          <div class="filter-bar">
            <input v-model="filterProduct" class="filter-input" placeholder="搜尋商品名稱..." />
          </div>

          <div v-if="isLoadingOrders" class="empty">載入中…</div>
          <template v-else>
            <!-- 場販訂單 -->
            <template v-if="selectedOfflineEvent">
              <div class="section-header">
                <span class="section-tag offline-tag">場販</span>
                <span class="section-name">{{ selectedOfflineEvent.name }}</span>
                <span class="section-total">{{ formatTwd(offlineTotalTwd) }}</span>
              </div>
              <div v-if="offlineOrders.length === 0" class="empty">此客戶在場販活動無訂單</div>
              <div v-else-if="filteredOfflineOrders.length === 0" class="empty">無符合的場販訂單</div>
              <table-component
                v-else
                :headerRow="offlineHeaders"
                :tableData="offlineTableData"
                :isEdit="false"
                :isDelete="false"
                :rowClass="(row) => isInactiveOrder(row.orderStatusName) ? 'inactive' : ''"
              />
            </template>

            <!-- 通販訂單 -->
            <template v-if="selectedOnlineEventIds.length > 0">
              <div class="section-header">
                <span class="section-tag online-tag">通販</span>
                <span class="section-name">{{ selectedOnlineEvents.map(e => e.name).join('、') }}</span>
                <span class="section-total">{{ formatTwd(onlineTotalTwd) }}</span>
              </div>
              <div v-if="onlineOrders.length === 0" class="empty">此客戶在通販活動無訂單</div>
              <div v-else-if="filteredOnlineOrders.length === 0" class="empty">無符合的通販訂單</div>
              <table-component
                v-else
                :headerRow="onlineHeaders"
                :tableData="onlineTableData"
                :isEdit="false"
                :isDelete="false"
              />
            </template>
          </template>
        </template>
        <div v-else class="empty">請點選左側客戶查看訂單明細</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.packing-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.page-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* ── 活動選取列 ── */
.selector-row {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.selector-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 200px;
  max-width: 280px;
}

.selector-item--grow {
  flex: 1;
  max-width: 480px;
}

.selector-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

/* ── 主體 ── */
.content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

/* ── 客戶面板 ── */
.customer-panel {
  width: 200px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    width: 240px;
    background: var(--color-surface);
    box-shadow: var(--shadow-lg);
    z-index: 200;
    padding: 1.25rem 1rem;
    box-sizing: border-box;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.25s ease;

    &.mobile-open {
      transform: translateX(0);
    }
  }
}

.mobile-backdrop {
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 199;
  }
}

.mobile-customer-btn {
  display: none;

  @media (max-width: 768px) {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 1rem;
    padding: 0.35rem 0.875rem;
    border: 1.5px solid var(--color-primary);
    border-radius: var(--radius-md, 6px);
    background: var(--color-surface);
    color: var(--color-primary);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;

    &::before {
      content: '☰';
      font-size: 0.8rem;
    }
  }
}

.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.panel-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.count {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  margin-bottom: 0.5rem;
  outline: none;
  background: var(--color-surface);
  transition: border-color 0.15s;

  &:focus { border-color: var(--color-primary); }
  &::placeholder { color: var(--color-text-muted); }
}

.customer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  max-height: 65vh;
  overflow-y: auto;
}

.customer-item {
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.1s, color 0.1s;
  border-bottom: 1px solid var(--color-border);
  line-height: 1.4;

  &:last-child { border-bottom: none; }

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    color: var(--color-primary);
  }

  &.selected {
    background: color-mix(in srgb, var(--color-primary) 14%, transparent);
    color: var(--color-primary);
    font-weight: 600;
    border-left: 3px solid var(--color-primary);
    padding-left: calc(0.75rem - 3px);
  }
}

/* ── 訂單面板 ── */
.order-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}

.total-badge {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-md, 8px);
  padding: 0.3rem 0.75rem;
}

.total-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
}

.total-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-primary);
}

.filter-bar {
  display: flex;
  gap: 0.75rem;
}

.filter-input {
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface);
  outline: none;
  min-width: 200px;
  transition: border-color 0.15s;

  &:focus { border-color: var(--color-primary); }
  &::placeholder { color: var(--color-text-muted); }
}

/* ── 分區標頭 ── */
.section-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0;
  border-bottom: 1.5px solid var(--color-border);
}

.section-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.55rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}

.offline-tag {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
  color: var(--color-primary-dark, var(--color-primary));
}

.online-tag {
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  color: var(--color-secondary-dark, var(--color-secondary));
}

.section-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-total {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  flex-shrink: 0;
}

/* ── 空狀態 ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.4;
}

.empty-text {
  font-size: 0.9rem;
}

.empty {
  color: var(--color-text-muted);
  font-size: 0.875rem;
  padding: 0.75rem 0;
}
</style>
