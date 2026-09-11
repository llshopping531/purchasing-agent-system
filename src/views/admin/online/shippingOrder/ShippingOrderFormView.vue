<script setup lang="ts">
/**
 * 通販出貨單 - 新增／編輯頁
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ShippingOrderTable from '@/components/tables/ShippingOrderTable.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import DateInput from '@/components/inputs/DateInput.vue'
import ShippingStatusSelectComponent from '@/components/inputs/selects/ShippingStatusSelectComponent.vue'
import { useShippingOrderStore, type ShippingOrderRowData, type ShippingOrderStatus } from '@/stores/shippingOrder'
import { useMenuStore } from '@/stores/menu'
import { onlineOrdersApi } from '@/services/api/online/online-orders/online-orders-api'
import type { OnlineEventsResBase } from '@/services/api/online/online-events/online-events-api-interfaces'
import type { QueryOnlineOrdersContent } from '@/services/api/online/online-orders/online-orders-api-interfaces'
import { formatTwd } from '@/utils/format'
import { PATH } from '@/constants/route.constant'

const router = useRouter()
const route = useRoute()
const store = useShippingOrderStore()
const menuStore = useMenuStore()

const isEditMode = computed(() => route.name === 'OnlineShippingOrderEdit')
const editId = computed(() => Number(route.params.id))

// ── 基本資訊 ─────────────────────────────────────────────────
const billName = ref('')
const deadline = ref('')
const status = ref<ShippingOrderStatus>('未出貨')

// ── 活動列表 ─────────────────────────────────────────────────
const allEvents = ref<OnlineEventsResBase[]>([])
const searchKeyword = ref('')
const selectedEventIds = ref<number[]>([])

const filteredEvents = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return allEvents.value
  return allEvents.value.filter((e) => e.name.toLowerCase().includes(kw))
})

// ── 訂單快取 ─────────────────────────────────────────────────
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

// ── 預覽資料 ──────────────────────────────────────────────────
const previewRows = computed<ShippingOrderRowData[]>(() => {
  const allOrders: (QueryOnlineOrdersContent & { _eventName: string })[] = []
  for (const eventId of selectedEventIds.value) {
    const event = allEvents.value.find((e) => e.id === eventId)
    const orders = ordersCache.value.get(eventId) ?? []
    if (event) {
      allOrders.push(...orders.map((o) => ({ ...o, _eventName: event.name })))
    }
  }

  const customerMap = new Map<number, typeof allOrders>()
  for (const order of allOrders) {
    if (!customerMap.has(order.customerId)) customerMap.set(order.customerId, [])
    customerMap.get(order.customerId)!.push(order)
  }

  return [...customerMap.entries()].map(([, orders]) => {
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
      customerName: orders[0]?.customerName ?? '',
      eventList,
      remainingAmount: totalAmount,
      domesticShipping: 0,
      internationalShipping: 0,
      packagingFee: 0,
      note: '',
    } satisfies ShippingOrderRowData
  })
})

const grandTotal = computed(() =>
  previewRows.value.reduce((sum, r) => sum + r.remainingAmount, 0),
)

const selectedEventNames = computed(() =>
  selectedEventIds.value
    .map((id) => allEvents.value.find((e) => e.id === id)?.name ?? '')
    .filter(Boolean),
)

// ── 掛載 ─────────────────────────────────────────────────────
onMounted(async () => {
  const events = await menuStore.fetchOnlineEventsAll()
  allEvents.value = events

  if (isEditMode.value) {
    const bill = store.getById(editId.value)
    if (!bill) {
      router.replace(PATH.shippingOrder)
      return
    }
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
    createdAt: new Date().toLocaleString('zh-TW'),
  }

  if (isEditMode.value) {
    store.update({ id: editId.value, ...data })
  } else {
    store.create(data)
  }

  router.push(PATH.shippingOrder)
}

function cancel() {
  router.push(PATH.shippingOrder)
}
</script>

<template>
  <div class="form-page">

    <!-- 頁首 -->
    <div class="form-header">
      <button class="back-btn" @click="cancel">← 返回</button>
      <h3>{{ isEditMode ? '編輯出貨單' : '新增出貨單' }}</h3>
    </div>

    <!-- 名稱 -->
    <div class="section-card">
      <text-input label="出貨單名稱" v-model:value="billName" placeholder="輸入名稱" required />
      <date-input label="截止日" v-model:value="deadline" required />
      <shipping-status-select-component
        :defaultValue="status"
        required
        @selectOption="status = $event.value"
      />
    </div>

    <!-- 活動選取 -->
    <div class="section-card">
      <div class="section-title">選取通販活動</div>

      <div class="search-wrap">
        <input class="search-input" v-model="searchKeyword" placeholder="搜尋活動名稱…" />
      </div>

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

    <!-- 預覽 -->
    <div class="section-card">
      <div class="preview-header">
        <span class="section-title">出貨單預覽</span>
        <span v-if="previewRows.length > 0" class="preview-meta">
          {{ previewRows.length }} 位顧客・剩餘未付合計 {{ formatTwd(grandTotal) }}
        </span>
      </div>

      <div v-if="selectedEventIds.length === 0" class="preview-empty">請先在上方勾選活動</div>
      <div v-else-if="loadingEventIds.size > 0" class="preview-empty">載入訂單中…</div>
      <div v-else-if="previewRows.length === 0" class="preview-empty">勾選的活動尚無訂單</div>
      <shipping-order-table v-else :rows="previewRows" />
    </div>

    <!-- 底部操作 -->
    <div class="form-footer">
      <button class="btn-cancel" @click="cancel">取消</button>
      <button
        class="btn-submit"
        @click="submit"
        :disabled="!billName.trim() || !deadline || selectedEventIds.length === 0 || previewRows.length === 0"
      >
        {{ isEditMode ? '儲存' : '建立出貨單' }}
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
