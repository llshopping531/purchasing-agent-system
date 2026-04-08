<script setup lang="ts">
/**
 * 個人購物清單查詢頁面
 * 選取活動後顯示有訂單的客戶清單，點選客戶後展開其個人訂單明細
 */
import { ref, computed } from 'vue'
import IconFlag from '@/components/icons/IconFlag.vue'
import EventSelectComponent, {
  type EventOption,
} from '@/components/inputs/selects/EventSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { customerOrdersApi } from '@/services/api/customer-orders/customer-orders-api'
import type { Option } from '@/interfaces/common'
import type {
  CustomerOrdersCustomer,
  CustomerOrder,
  ChannelBonus,
} from '@/services/api/customer-orders/customer-orders-api-interfaces'

/** 目前選取的活動 ID */
const currentEventId = ref<number | null>(null)

/** 手機版客戶清單是否展開 */
const isCustomerPanelOpen = ref(false)

/** 活動內有訂單的客戶清單 */
const customerList = ref<CustomerOrdersCustomer[]>([])

/** 搜尋關鍵字 */
const searchKeyword = ref('')

/** 目前選取的客戶 */
const selectedCustomer = ref<CustomerOrdersCustomer | null>(null)

/** 選取客戶的個人訂單清單 */
const orderList = ref<CustomerOrder[]>([])

/** 選取客戶的各通路滿額狀態 */
const channelBonusList = ref<ChannelBonus[]>([])

/** 訂單標記 Map：orderId → 標記類型（1=橘, 2=紅） */
const markedOrders = ref<Map<number, 1 | 2>>(new Map())

const MARK_STORAGE_KEY = 'customerOrderMarks'
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000

type MarkEntry = { type: 1 | 2; markedAt: number }

/** 從 localStorage 載入訂單標記，並過濾已過期項目 */
function loadMarks() {
  const raw = localStorage.getItem(MARK_STORAGE_KEY)
  const store: Record<string, MarkEntry> = raw ? JSON.parse(raw) : {}
  const now = Date.now()
  const map = new Map<number, 1 | 2>()
  for (const [key, entry] of Object.entries(store)) {
    if (now - entry.markedAt > TWO_WEEKS_MS) delete store[key]
    else map.set(Number(key), entry.type)
  }
  localStorage.setItem(MARK_STORAGE_KEY, JSON.stringify(store))
  markedOrders.value = map
}

/** 循環切換訂單標記：無 → 1（橘）→ 2（紅）→ 無 */
function toggleMark(orderId: number) {
  const raw = localStorage.getItem(MARK_STORAGE_KEY)
  const store: Record<string, MarkEntry> = raw ? JSON.parse(raw) : {}
  const key = String(orderId)
  const current = markedOrders.value.get(orderId)
  const next = current === undefined ? 1 : current === 1 ? 2 : undefined

  if (next === undefined) {
    delete store[key]
    markedOrders.value.delete(orderId)
  } else {
    store[key] = { type: next, markedAt: Date.now() }
    markedOrders.value.set(orderId, next)
  }
  localStorage.setItem(MARK_STORAGE_KEY, JSON.stringify(store))
}

/** 通路篩選 */
const filterChannel = ref('')

/** 商品名稱搜尋 */
const filterProduct = ref('')

/** 模糊篩選後的客戶清單（不區分大小寫） */
const filteredCustomerList = computed(() => {
  const keyword = searchKeyword.value.toLowerCase()
  return customerList.value.filter((c) => c.name.toLowerCase().includes(keyword))
})

/** 可選通路清單（從訂單資料中萃取，符合 Option 格式） */
const channelOptions = computed<Option[]>(() => {
  const names = [...new Set(orderList.value.map((o) => o.channelName))]
  return [{ value: '', name: '全部通路' }, ...names.map((n) => ({ value: n, name: n }))]
})

/** 目前通路篩選的 Option（供 SelectComponent defaultValue 使用） */
const selectedChannelOption = computed<Option>(() =>
  channelOptions.value.find((o) => o.value === filterChannel.value) ?? { value: '', name: '全部通路' },
)

/** 篩選後的訂單清單 */
const filteredOrderList = computed(() =>
  orderList.value.filter((o) => {
    const matchChannel = !filterChannel.value || o.channelName === filterChannel.value
    const matchProduct = !filterProduct.value || o.productName.includes(filterProduct.value)
    return matchChannel && matchProduct
  }),
)

/** 已購買訂單的台幣總金額 */
const totalTwd = computed(() =>
  orderList.value
    .filter((o) => o.orderStatusName === '已購買')
    .reduce((sum, o) => sum + o.subtotalTwd, 0),
)

/** 已購買訂單的日幣總金額 */
const totalJpy = computed(() =>
  orderList.value
    .filter((o) => o.orderStatusName === '已購買')
    .reduce((sum, o) => sum + o.subtotalJpy, 0),
)

/** 訂單清單表頭 */
const orderHeaderRow: HeaderRow[] = [
  { name: '', value: 'mark', sort: 0, width: '40px' },
  { name: '通路', value: 'channelName', sort: 1, width: '100px' },
  { name: '商品名稱', value: 'productName', sort: 1, width: '250px' },
  { name: '數量', value: 'quantity', sort: 2, width: '70px' },
  { name: '日幣小計', value: 'subtotalJpy', sort: 3, width: '100px' },
  { name: '台幣小計', value: 'subtotalTwd', sort: 4, width: '100px' },
  { name: '訂單狀態', value: 'orderStatusName', sort: 5, width: '100px' },
]

const isInactive = (row: CustomerOrder) =>
  row.orderStatusName === '缺貨' || row.orderStatusName === '已取消'

/**
 * 選取活動，重新載入有訂單的客戶清單
 */
async function selectEvent(data: EventOption) {
  currentEventId.value = Number(data.selectedData.value)
  selectedCustomer.value = null
  orderList.value = []
  searchKeyword.value = ''
  loadMarks()
  const res = await customerOrdersApi.getCustomers({ eventId: currentEventId.value })
  customerList.value = res
}

/**
 * 選取客戶，載入其個人訂單明細與滿額狀態
 */
async function selectCustomer(customer: CustomerOrdersCustomer) {
  if (!currentEventId.value) return
  selectedCustomer.value = customer
  filterChannel.value = ''
  filterProduct.value = ''
  isCustomerPanelOpen.value = false
  const [orders, bonus] = await Promise.all([
    customerOrdersApi.getCustomerOrders({ customerId: customer.id, eventId: currentEventId.value }),
    customerOrdersApi.getChannelBonus({ customerId: customer.id, eventId: currentEventId.value }),
  ])
  orderList.value = orders
  channelBonusList.value = bonus
}
</script>

<template>
  <div class="customer-orders">
    <h3>個人購物清單</h3>
    <p>請選擇活動後，點選客戶查看其購物明細</p>

    <div class="selectBox">
      <event-select-component @selectOption="selectEvent" />
    </div>

    <div v-if="currentEventId" class="content">
      <!-- 手機版遮罩 -->
      <transition name="fade">
        <div v-if="isCustomerPanelOpen" class="mobile-backdrop" @click="isCustomerPanelOpen = false" />
      </transition>

      <!-- 客戶清單 -->
      <div class="customer-panel" :class="{ 'mobile-open': isCustomerPanelOpen }">
        <div class="panel-header">
          <span class="panel-title">客戶清單</span>
          <span class="count">{{ filteredCustomerList.length }} 人</span>
        </div>
        <input v-model="searchKeyword" class="search-input" placeholder="搜尋客戶名稱..." />
        <div v-if="customerList.length === 0" class="empty">此活動尚無訂單資料</div>
        <div v-else-if="filteredCustomerList.length === 0" class="empty">無符合的客戶</div>
        <ul v-else class="customer-list">
          <li
            v-for="customer in filteredCustomerList"
            :key="customer.id"
            class="customer-item"
            :class="{ selected: selectedCustomer?.id === customer.id }"
            @click="selectCustomer(customer)"
          >
            {{ customer.name }}
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
          <h4>{{ selectedCustomer.name }} 的訂單明細</h4>

          <!-- 通路滿額狀態 -->
          <div v-if="channelBonusList.length > 0" class="bonus-section">
            <div
              v-for="bonus in channelBonusList"
              :key="bonus.channelName"
              class="bonus-card"
              :class="{ reached: bonus.bonusCount > 0 }"
            >
              <div class="bonus-channel">{{ bonus.channelName }}</div>
              <div class="bonus-progress-wrap">
                <div
                  class="bonus-progress-bar"
                  :style="{ width: Math.min((bonus.totalJpy / bonus.thresholdJpy) * 100, 100) + '%' }"
                />
              </div>
              <div class="bonus-info">
                <span>¥{{ bonus.totalJpy.toLocaleString() }} / ¥{{ bonus.thresholdJpy.toLocaleString() }}</span>
                <span class="bonus-count">已滿額 {{ bonus.bonusCount }} 次</span>
              </div>
              <div class="bonus-remaining">
                還差 ¥{{ ((bonus.bonusCount + 1) * bonus.thresholdJpy - bonus.totalJpy).toLocaleString() }} 達下次滿額
              </div>
            </div>
          </div>

          <!-- 篩選列 + 總金額 -->
          <div class="filter-bar">
            <select-component
              label=""
              :optionList="channelOptions"
              :defaultValue="selectedChannelOption"
              @selectOption="filterChannel = $event.value"
            />
            <input v-model="filterProduct" class="filter-input" placeholder="搜尋商品名稱..." />
            <div class="total-inline">
              <span class="total-label">已購買總金額</span>
              <span class="total-value">¥{{ totalJpy.toLocaleString() }}　NT${{ totalTwd.toLocaleString() }}</span>
            </div>
          </div>

          <div v-if="orderList.length === 0" class="empty">此客戶在本活動無訂單</div>
          <div v-else-if="filteredOrderList.length === 0" class="empty">無符合篩選條件的訂單</div>
          <table-component
            v-else
            :headerRow="orderHeaderRow"
            :tableData="filteredOrderList"
            :isEdit="false"
            :isDelete="false"
          >
            <template #col-mark="{ row }">
            <div class="mark-box" @click="toggleMark(row.id)">
              <icon-flag
                class="mark-btn"
                :class="{
                  'mark-1': markedOrders.get(row.id) === 1,
                  'mark-2': markedOrders.get(row.id) === 2,
                }"

              />
            </div>
            </template>
            <template #col-channelName="{ row }">
              <span :class="{ 'out-of-stock': isInactive(row) }" class="row-cell" @click="toggleMark(row.id)">{{ row.channelName }}</span>
            </template>
            <template #col-productName="{ row }">
              <span :class="{ 'out-of-stock': isInactive(row) }" class="row-cell" @click="toggleMark(row.id)">{{ row.productName }}</span>
            </template>
            <template #col-quantity="{ row }">
              <span :class="{ 'out-of-stock': isInactive(row) }" class="row-cell" @click="toggleMark(row.id)">{{ row.quantity }}</span>
            </template>
            <template #col-subtotalJpy="{ row }">
              <span :class="{ 'out-of-stock': isInactive(row) }" class="row-cell" @click="toggleMark(row.id)">{{ row.subtotalJpy }}</span>
            </template>
            <template #col-subtotalTwd="{ row }">
              <span :class="{ 'out-of-stock': isInactive(row) }" class="row-cell" @click="toggleMark(row.id)">{{ row.subtotalTwd }}</span>
            </template>
            <template #col-orderStatusName="{ row }">
              <span :class="{ 'out-of-stock': isInactive(row) }" class="row-cell" @click="toggleMark(row.id)">{{ row.orderStatusName }}</span>
            </template>
          </table-component>
        </template>
        <div v-else class="empty">請點選左側客戶查看訂單明細</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customer-orders {
  .selectBox {
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
  width: 180px;
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
    border-color: var(--color-primary);
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

  h4 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}

/* ── 滿額狀態 ── */
.bonus-section {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.bonus-card {
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  padding: 0.6rem 0.875rem;
  min-width: 180px;
  background: var(--color-surface);

  &.reached {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  }
}

.bonus-channel {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--color-text-secondary);
}

.bonus-progress-wrap {
  height: 6px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.bonus-progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: 99px;
  transition: width 0.3s ease;
}

.bonus-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-muted, #888);
}

.bonus-count {
  font-weight: 600;
  color: var(--color-primary);
}

.bonus-remaining {
  margin-top: 0.3rem;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
  font-weight: 500;
}

/* ── 篩選列 + 總金額 ── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.total-inline {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-md, 8px);
  padding: 0.35rem 0.75rem;
}

.total-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
}

.total-value {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-primary);
}

.filter-input {
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface);
  outline: none;
  min-width: 180px;
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-muted, #bbb);
  }
}
.mark-box{
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.mark-btn {
  cursor: pointer;
  color: var(--color-border);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  transition: color 0.15s;
  user-select: none;
  display: block;

  &:hover {
    color: var(--color-text-muted, #aaa);
  }

  &.mark-1 {
    color: #16a34a;
  }

  &.mark-2 {
    color: var(--color-danger, #e53e3e);
  }
}

.row-cell {
  cursor: pointer;
  display: block;
  width: 100%;
}

/* ── 共用 ── */
.out-of-stock {
  color: var(--color-danger, #e53e3e);
  text-decoration: line-through;
  opacity: 0.8;
}

.empty {
  color: var(--color-text-muted, #aaa);
  font-size: 0.875rem;
  padding: 1rem 0;
}
</style>
