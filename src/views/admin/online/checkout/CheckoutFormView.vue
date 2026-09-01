<script setup lang="ts">
/**
 * 通販結帳單 - 新增／編輯頁
 *
 * 上半：搜尋通販活動並勾選，勾選後即時載入該活動訂單
 * 下半：依勾選活動聚合訂單，以 CheckoutTable 顯示預覽
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CheckoutTable from '@/components/tables/CheckoutTable.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import DateInput from '@/components/inputs/DateInput.vue'
import { useCheckoutStore, type CheckoutRowData, type CheckoutBillStatus } from '@/stores/checkout'
import CheckoutStatusSelectComponent from '@/components/inputs/selects/CheckoutStatusSelectComponent.vue'
import { useMenuStore } from '@/stores/menu'
import { onlineOrdersApi } from '@/services/api/online/online-orders/online-orders-api'
import type { OnlineEventsResBase } from '@/services/api/online/online-events/online-events-api-interfaces'
import type { QueryOnlineOrdersContent } from '@/services/api/online/online-orders/online-orders-api-interfaces'
import { formatTwd } from '@/utils/format'
import { PATH } from '@/constants/route.constant'

const router = useRouter()
const route = useRoute()
const checkoutStore = useCheckoutStore()
const menuStore = useMenuStore()

const isEditMode = computed(() => route.name === 'OnlineCheckoutEdit')
const editId = computed(() => Number(route.params.id))

// ── 基本資訊 ─────────────────────────────────────────────────
const billName = ref('')
const deadline = ref('')
const status = ref<CheckoutBillStatus>('未收款')

// ── 活動列表 ─────────────────────────────────────────────────
const allEvents = ref<OnlineEventsResBase[]>([])
const searchKeyword = ref('')
const selectedEventIds = ref<number[]>([])

const filteredEvents = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return allEvents.value
  return allEvents.value.filter((e) => e.name.toLowerCase().includes(kw))
})

// ── 訂單快取（eventId → orders）────────────────────────────
const ordersCache = ref<Map<number, QueryOnlineOrdersContent[]>>(new Map())
const loadingEventIds = ref<Set<number>>(new Set())

async function loadEventOrders(eventId: number) {
  if (ordersCache.value.has(eventId)) return
  loadingEventIds.value.add(eventId)
  try {
    const res = await onlineOrdersApi.getOnlineOrders({ eventId, size: 9999, page: 0 })
    ordersCache.value.set(eventId, res.content)
  } finally {
    loadingEventIds.value.delete(eventId)
  }
}

async function toggleEvent(event: OnlineEventsResBase) {
  const idx = selectedEventIds.value.indexOf(event.id)
  if (idx !== -1) {
    selectedEventIds.value.splice(idx, 1)
  } else {
    selectedEventIds.value.push(event.id)
    await loadEventOrders(event.id)
  }
}

function isSelected(id: number) {
  return selectedEventIds.value.includes(id)
}

function isLoading(id: number) {
  return loadingEventIds.value.has(id)
}

// ── 預覽資料（依勾選活動聚合訂單）────────────────────────────
const previewRows = computed<CheckoutRowData[]>(() => {
  // 收集所有已選活動的訂單
  const allOrders: (QueryOnlineOrdersContent & { _eventName: string })[] = []
  for (const eventId of selectedEventIds.value) {
    const event = allEvents.value.find((e) => e.id === eventId)
    const orders = ordersCache.value.get(eventId) ?? []
    if (event) {
      allOrders.push(...orders.map((o) => ({ ...o, _eventName: event.name })))
    }
  }

  // 依顧客分組
  const customerMap = new Map<number, typeof allOrders>()
  for (const order of allOrders) {
    if (!customerMap.has(order.customerId)) customerMap.set(order.customerId, [])
    customerMap.get(order.customerId)!.push(order)
  }

  return [...customerMap.entries()].map(([, orders]) => {
    // 顧客內依活動分組
    const eventMap = new Map<string, typeof orders>()
    for (const order of orders) {
      if (!eventMap.has(order._eventName)) eventMap.set(order._eventName, [])
      eventMap.get(order._eventName)!.push(order)
    }

    const eventList = [...eventMap.entries()].map(([eventName, evOrders]) => ({
      eventName,
      items: evOrders.map((o) => ({
        name: o.productName,
        quantity: o.quantity,
        unitPrice: o.quantity > 0 ? Math.round(o.subtotalTwd / o.quantity) : 0,
        itemTotal: o.subtotalTwd,
      })),
    }))

    const totalAmount = orders.reduce((sum, o) => sum + o.subtotalTwd, 0)

    return {
      customerName: orders[0].customerName,
      eventList,
      total: formatTwd(totalAmount),
      _totalAmount: totalAmount,
      remittedAmount: 0,
      reconciled: false,
      note: '',
    } satisfies CheckoutRowData
  })
})

const grandTotal = computed(() =>
  previewRows.value.reduce((sum, r) => sum + r._totalAmount, 0),
)

const selectedEventNames = computed(() =>
  selectedEventIds.value
    .map((id) => allEvents.value.find((e) => e.id === id)?.name ?? '')
    .filter(Boolean),
)

// ── 掛載：載入活動列表，編輯模式還原 ──────────────────────────
onMounted(async () => {
  const events = await menuStore.fetchOnlineEventsAll()
  allEvents.value = events

  if (isEditMode.value) {
    const bill = checkoutStore.getById(editId.value)
    if (!bill) {
      router.replace(PATH.checkout)
      return
    }
    // 還原已選活動並重新載入訂單
    billName.value = bill.name
    deadline.value = bill.deadline
    status.value = bill.status
    selectedEventIds.value = [...bill.eventIds]
    await Promise.all(bill.eventIds.map(loadEventOrders))
  }
})

// ── 存檔 ─────────────────────────────────────────────────────
function submit() {
  if (!billName.value.trim() || !deadline.value || selectedEventIds.value.length === 0) return

  const data = {
    name: billName.value.trim(),
    deadline: deadline.value,
    status: status.value,
    eventIds: [...selectedEventIds.value],
    eventNames: selectedEventNames.value,
    rows: previewRows.value,
    total: grandTotal.value,
    createdAt: new Date().toLocaleString('zh-TW'),
  }

  if (isEditMode.value) {
    checkoutStore.update({ id: editId.value, ...data })
  } else {
    checkoutStore.create(data)
  }

  router.push(PATH.checkout)
}

function cancel() {
  router.push(PATH.checkout)
}
</script>

<template>
  <div class="form-page">

    <!-- 頁首 -->
    <div class="form-header">
      <button class="back-btn" @click="cancel">← 返回</button>
      <h3>{{ isEditMode ? '編輯結帳單' : '新增結帳單' }}</h3>
    </div>

    <!-- 名稱 -->
    <div class="section-card">
      <text-input label="結帳單名稱" v-model:value="billName" placeholder="輸入名稱" required />
      <date-input label="截止日" v-model:value="deadline" required />
      <checkout-status-select-component
        :defaultValue="status"
        required
        @selectOption="status = $event.value"
      />
    </div>

    <!-- ── 上半：活動選取 ───────────────────────────────────── -->
    <div class="section-card">
      <div class="section-title">選取通販活動</div>

      <!-- 搜尋框 -->
      <div class="search-wrap">
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜尋活動名稱…"
        />
      </div>

      <!-- 活動列表 -->
      <div class="event-list" v-if="allEvents.length > 0">
        <label
          v-for="event in filteredEvents"
          :key="event.id"
          class="event-item"
          :class="{ 'event-item--selected': isSelected(event.id) }"
        >
          <input
            type="checkbox"
            :checked="isSelected(event.id)"
            :disabled="isLoading(event.id)"
            @change="toggleEvent(event)"
          />
          <span class="event-name">{{ event.name }}</span>
          <span class="event-meta">{{ event.startDate }}</span>
          <span class="event-progress">{{ event.progressName }}</span>
          <span v-if="isLoading(event.id)" class="event-loading">載入中…</span>
        </label>
        <div v-if="filteredEvents.length === 0" class="event-empty">無符合的活動</div>
      </div>
      <div v-else class="event-empty">載入中…</div>
    </div>

    <!-- ── 下半：預覽 ────────────────────────────────────────── -->
    <div class="section-card">
      <div class="preview-header">
        <span class="section-title">結帳單預覽</span>
        <span v-if="previewRows.length > 0" class="preview-meta">
          {{ previewRows.length }} 位顧客・合計 {{ formatTwd(grandTotal) }}
        </span>
      </div>

      <div v-if="selectedEventIds.length === 0" class="preview-empty">
        請先在上方勾選活動
      </div>
      <div v-else-if="loadingEventIds.size > 0" class="preview-empty">
        載入訂單中…
      </div>
      <div v-else-if="previewRows.length === 0" class="preview-empty">
        勾選的活動尚無訂單
      </div>
      <checkout-table v-else :rows="previewRows" />
    </div>

    <!-- 底部操作 -->
    <div class="form-footer">
      <button class="btn-cancel" @click="cancel">取消</button>
      <button
        class="btn-submit"
        @click="submit"
        :disabled="!billName.trim() || !deadline || selectedEventIds.length === 0 || previewRows.length === 0"
      >
        {{ isEditMode ? '儲存' : '建立結帳單' }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.form-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 2rem;
}

/* ── 頁首 ── */
.form-header {
  display: flex;
  align-items: center;
  gap: 1rem;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text);
  }
}

.back-btn {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
  white-space: nowrap;

  &:hover {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }
}

/* ── 卡片 ── */
.section-card {
  background: var(--color-surface);
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
}

/* ── 搜尋框 ── */
.search-wrap {
  max-width: 360px;
}

.search-input {
  width: 100%;
  padding: 0.45rem 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
}

/* ── 活動列表 ── */
.event-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.25rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.12s;
  font-size: 0.875rem;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  }

  &--selected {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }

  input[type='checkbox'] {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    cursor: pointer;
    accent-color: var(--color-primary);
  }
}

.event-name {
  flex: 1;
  font-weight: 500;
  color: var(--color-text);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-meta {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.event-progress {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
  color: var(--color-secondary-dark, var(--color-secondary));
  white-space: nowrap;
}

.event-loading {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.event-empty {
  padding: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

/* ── 預覽 ── */
.preview-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.preview-meta {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

.preview-empty {
  padding: 2.5rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

/* ── 底部按鈕 ── */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  padding: 0.45rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

.btn-submit {
  padding: 0.45rem 1.4rem;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}
</style>
