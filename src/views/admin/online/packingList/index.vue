<script setup lang="ts">
/**
 * 通販包貨清單查詢頁面
 * 選取一或多個通販活動，載入有訂單的客戶清單，點選客戶後展開其訂單明細
 */
import { ref, computed, onMounted } from 'vue'
import { formatTwd } from '@/utils/format'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { onlinePackingListApi } from '@/services/api/online/packing-list/online-packing-list-api'
import { onlineEventApi } from '@/services/api/online/online-events/online-events-api'
import type { OnlinePackingCustomer, OnlinePackingOrder } from '@/services/api/online/packing-list/online-packing-list-api-interfaces'
import type { OnlineEventsResBase } from '@/services/api/online/online-events/online-events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'

/** 所有通販活動清單 */
const allEvents = ref<OnlineEventsResBase[]>([])

/** 已選取的通販活動 */
const selectedEvents = ref<SelectOption<OnlineEventsResBase>[]>([])

/** 活動選單選項 */
const eventOptions = computed<SelectOption<OnlineEventsResBase>[]>(() =>
  allEvents.value.map((e) => ({ name: e.name, value: e })),
)

/** 已選活動 ID 列表 */
const selectedEventIds = computed(() => selectedEvents.value.map((e) => e.value.id))

/** 有訂單的客戶清單 */
const customerList = ref<OnlinePackingCustomer[]>([])

/** 搜尋關鍵字 */
const searchKeyword = ref('')

/** 目前選取的客戶 */
const selectedCustomer = ref<OnlinePackingCustomer | null>(null)

/** 選取客戶的訂單清單 */
const orderList = ref<OnlinePackingOrder[]>([])

/** 商品名稱搜尋 */
const filterProduct = ref('')

/** 手機版客戶清單是否展開 */
const isCustomerPanelOpen = ref(false)

const isLoadingCustomers = ref(false)
const isLoadingOrders = ref(false)

/** 模糊篩選後的客戶清單 */
const filteredCustomerList = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return customerList.value.filter((c) => c.name.toLowerCase().includes(keyword))
})

/** 篩選後的訂單清單 */
const filteredOrderList = computed(() =>
  orderList.value.filter(
    (o) => !filterProduct.value || o.productName.includes(filterProduct.value),
  ),
)

/** 台幣總金額 */
const totalTwd = computed(() => orderList.value.reduce((sum, o) => sum + o.subtotalTwd, 0))

/** 訂單清單表頭 */
const orderHeaderRow: HeaderRow[] = [
  { name: '活動', value: 'officialOrderName', sort: 0, width: '160px', mobileSpan: 2 },
  { name: '商品名稱', value: 'productName', sort: 1, mobileSpan: 2 },
  { name: '數量', value: 'quantity', sort: 2, width: '70px' },
  { name: '台幣小計', value: 'subtotalTwdFmt', sort: 3, width: '100px' },
  { name: '國內運費', value: 'domesticShippingFmt', sort: 4, width: '100px' },
  { name: '國際運費', value: 'internationalShippingFmt', sort: 5, width: '100px' },
  { name: '備註', value: 'note', sort: 6, width: '120px' },
]

const tableData = computed(() =>
  filteredOrderList.value.map((o) => ({
    ...o,
    subtotalTwdFmt: formatTwd(o.subtotalTwd),
    domesticShippingFmt: o.domesticShipping ? formatTwd(o.domesticShipping) : '-',
    internationalShippingFmt: o.internationalShipping ? formatTwd(o.internationalShipping) : '-',
  })),
)

onMounted(async () => {
  allEvents.value = await onlineEventApi.getAllOnlineEvents()
})

async function onSelectEvents(opts: SelectOption<OnlineEventsResBase>[]) {
  selectedEvents.value = opts
  selectedCustomer.value = null
  orderList.value = []
  searchKeyword.value = ''

  if (opts.length === 0) {
    customerList.value = []
    return
  }

  isLoadingCustomers.value = true
  try {
    customerList.value = await onlinePackingListApi.getCustomers({ eventIds: selectedEventIds.value })
  } finally {
    isLoadingCustomers.value = false
  }
}

async function selectCustomer(customer: OnlinePackingCustomer) {
  selectedCustomer.value = customer
  filterProduct.value = ''
  isCustomerPanelOpen.value = false

  isLoadingOrders.value = true
  try {
    orderList.value = await onlinePackingListApi.getCustomerOrders({
      customerId: customer.id,
      eventIds: selectedEventIds.value,
    })
  } finally {
    isLoadingOrders.value = false
  }
}
</script>

<template>
  <div class="packing-list">
    <h3>通販包貨清單</h3>
    <p>選取一或多個通販活動，點選客戶查看其訂單明細</p>

    <div class="event-select-wrap">
      <select-component
        label="通販活動"
        :isDisplayLable="false"
        :optionList="eventOptions"
        :defaultValue="undefined"
        :multiple="true"
        :selectedValues="selectedEvents"
        @selectOptions="onSelectEvents"
      />
    </div>

    <div v-if="selectedEvents.length > 0" class="content">
      <!-- 手機版遮罩 -->
      <transition name="fade">
        <div
          v-if="isCustomerPanelOpen"
          class="mobile-backdrop"
          @click="isCustomerPanelOpen = false"
        />
      </transition>

      <!-- 客戶清單 -->
      <div class="customer-panel" :class="{ 'mobile-open': isCustomerPanelOpen }">
        <div class="panel-header">
          <span class="panel-title">客戶清單</span>
          <span class="count">{{ filteredCustomerList.length }} 人</span>
        </div>
        <input v-model="searchKeyword" class="search-input" placeholder="搜尋客戶名稱..." />
        <div v-if="isLoadingCustomers" class="empty">載入中…</div>
        <div v-else-if="customerList.length === 0" class="empty">此活動尚無訂單資料</div>
        <div v-else-if="filteredCustomerList.length === 0" class="empty">無符合的客戶</div>
        <ul v-else class="customer-list">
          <li
            v-for="customer in filteredCustomerList"
            :key="customer.id"
            class="customer-item"
            :class="{ selected: selectedCustomer?.id === customer.id }"
            @click="selectCustomer(customer)"
          >
            <span class="customer-name">{{ customer.name }}</span>
          </li>
        </ul>
      </div>

      <!-- 訂單明細 -->
      <div class="order-panel">
        <!-- 手機版開啟客戶清單按鈕 -->
        <button class="mobile-customer-btn" @click="isCustomerPanelOpen = true">
          {{ selectedCustomer ? selectedCustomer.name : '選擇客戶' }}
        </button>

        <template v-if="selectedCustomer">
          <div class="order-header">
            <h4>{{ selectedCustomer.name }} 的訂單明細</h4>
            <div class="total-inline">
              <span class="total-label">台幣總金額</span>
              <span class="total-value">{{ formatTwd(totalTwd) }}</span>
            </div>
          </div>

          <div class="filter-bar">
            <input v-model="filterProduct" class="filter-input" placeholder="搜尋商品名稱..." />
          </div>

          <div v-if="isLoadingOrders" class="empty">載入中…</div>
          <div v-else-if="orderList.length === 0" class="empty">此客戶在所選活動內無訂單</div>
          <div v-else-if="filteredOrderList.length === 0" class="empty">無符合篩選條件的訂單</div>
          <table-component
            v-else
            :headerRow="orderHeaderRow"
            :tableData="tableData"
            :isEdit="false"
            :isDelete="false"
          />
        </template>
        <div v-else class="empty">請點選左側客戶查看訂單明細</div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📦</div>
      <div class="empty-text">請先選取通販活動以載入客戶清單</div>
    </div>
  </div>
</template>

<style scoped>
.packing-list {
  .event-select-wrap {
    max-width: 480px;
    margin-bottom: 1.5rem;
  }
}

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
    border: 1.5px solid var(--color-secondary);
    border-radius: var(--radius-md, 6px);
    background: var(--color-surface);
    color: var(--color-secondary);
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
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

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
  color: var(--color-text-muted, #aaa);
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

  &:focus {
    border-color: var(--color-secondary);
  }

  &::placeholder {
    color: var(--color-text-muted, #bbb);
  }
}

.customer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  max-height: 60vh;
  overflow-y: auto;
}

.customer-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.1s, color 0.1s;
  border-bottom: 1px solid var(--color-border);
  line-height: 1.4;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: color-mix(in srgb, var(--color-secondary) 8%, transparent);
    color: var(--color-secondary-dark);
  }

  &.selected {
    background: color-mix(in srgb, var(--color-secondary) 14%, transparent);
    color: var(--color-secondary-dark);
    font-weight: 600;
    border-left: 3px solid var(--color-secondary);
    padding-left: calc(0.75rem - 3px);
  }
}

/* ── 訂單面板 ── */
.order-panel {
  flex: 1;
  min-width: 0;
}

.order-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}

.total-inline {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: color-mix(in srgb, var(--color-secondary) 6%, transparent);
  border: 1.5px solid var(--color-secondary);
  border-radius: var(--radius-md, 8px);
  padding: 0.35rem 0.75rem;
}

.total-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-secondary-dark);
}

.total-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-secondary-dark);
}

.filter-bar {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
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

  &:focus {
    border-color: var(--color-secondary);
  }

  &::placeholder {
    color: var(--color-text-muted, #bbb);
  }
}

/* ── 空狀態 ── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--color-text-muted, #aaa);
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.4;
}

.empty-text {
  font-size: 0.9rem;
}

.empty {
  color: var(--color-text-muted, #aaa);
  font-size: 0.875rem;
  padding: 1rem 0;
}
</style>
