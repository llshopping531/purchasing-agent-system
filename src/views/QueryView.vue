<script setup lang="ts">
/**
 * 公開訂單查詢頁
 * 透過 URL 中的 queryUuid 查詢該客戶的充實後訂單列表，不需登入
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { queryApi } from '@/services/api/query/query-api'
import { eventApi } from '@/services/api/events/events-api'
import { formatTwd } from '@/utils/format'

const PACKAGING_FEE = 10

const now = new Date()
import type { QueryOrderEnriched } from '@/services/api/query/query-api-interfaces'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'

const headers: HeaderRow[] = [
  { name: '通路',     value: 'channelName',    sort: 1 },
  { name: '商品名稱', value: 'productName',     sort: 2 },
  { name: '數量',    value: 'quantity',         sort: 3, width: '80px' },
  { name: '台幣小計', value: 'subtotalTwd',     sort: 4, width: '120px' },
  { name: '狀態',    value: 'orderStatusName',  sort: 5, width: '90px' },
]

function rowClass(row: QueryOrderEnriched) {
  return row.orderStatusName !== '已購買' ? 'inactive' : ''
}

const route = useRoute()
const router = useRouter()

const orders = ref<QueryOrderEnriched[]>([])
const isLoading = ref(true)
const isError = ref(false)
const customerName = ref('')
const eventNames = ref<Map<number, string>>(new Map())
const activeEventId = ref<number | null>(null)

/** 依活動 ID 分組 */
const groupedOrders = computed(() => {
  const map = new Map<number, QueryOrderEnriched[]>()
  for (const order of orders.value) {
    const list = map.get(order.eventId) ?? []
    list.push(order)
    map.set(order.eventId, list)
  }
  return map
})

/** 活動 ID 清單（依插入順序） */
const eventIds = computed(() => [...groupedOrders.value.keys()])

/** 當前頁籤的訂單清單 */
const activeOrders = computed(() =>
  activeEventId.value !== null ? (groupedOrders.value.get(activeEventId.value) ?? []) : []
)

/** 當前頁籤已購買台幣總計 */
const activeTabTotalTwd = computed(() =>
  activeOrders.value.filter((o) => o.orderStatusName === '已購買').reduce((s, o) => s + o.subtotalTwd, 0)
)


function selectTab(eventId: number) {
  activeEventId.value = eventId
  router.replace({ query: { ...route.query, tab: eventId } })
}

onMounted(async () => {
  const uuid = route.params.uuid as string
  try {
    const [customer, orderList] = await Promise.all([
      queryApi.getCustomer(uuid).catch(() => null),
      queryApi.getOrdersWithEnrichment(uuid),
    ])
    customerName.value = customer?.name ?? ''
    orders.value = orderList

    // 決定初始 tab（優先讀 URL 參數）
    const tabParam = Number(route.query.tab)
    const ids = [...new Set(orders.value.map((o) => o.eventId))]
    activeEventId.value = ids.includes(tabParam) ? tabParam : (ids[0] ?? null)

    // 平行載入所有活動名稱
    await Promise.all(
      ids.map(async (id) => {
        const event = await eventApi.getEventById(id)
        eventNames.value = new Map(eventNames.value).set(id, event.name)
      })
    )
  } catch {
    isError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="query-page">
    <div class="query-card">
      <h2 class="page-title">{{ customerName ? `${customerName} 的訂單` : '訂單查詢' }}</h2>

      <div v-if="isLoading" class="state-msg">載入中…</div>

      <div v-else-if="isError" class="state-msg error">查無資料，請確認連結是否正確</div>

      <template v-else-if="orders.length > 0">

        <!-- 活動頁籤 -->
        <div class="tab-bar">
          <button
            v-for="eventId in eventIds"
            :key="eventId"
            class="tab-btn"
            :class="{ active: activeEventId === eventId }"
            @click="selectTab(eventId)"
          >
            {{ eventNames.get(eventId) ?? `活動 #${eventId}` }}
          </button>
        </div>

        <!-- 當前活動內容 -->
        <div class="tab-panel">
          <div class="tab-panel-header">
            <span class="tab-panel-title">{{ eventNames.get(activeEventId!) ?? `活動 #${activeEventId}` }}</span>
            <div class="tab-panel-right">
              <span class="tab-panel-total">
                合計 {{ formatTwd(activeTabTotalTwd) }}
                <span class="packaging">+ 包材 {{ formatTwd(PACKAGING_FEE) }} = </span>
                <strong>{{ formatTwd(activeTabTotalTwd + PACKAGING_FEE) }}</strong>
              </span>
              <span class="query-time">查詢時間 {{ now.toLocaleString('zh-TW') }}</span>

            </div>
          </div>

          <TableComponent
            :tableData="activeOrders"
            :headerRow="headers"
            :isDelete="false"
            :isEdit="false"
            :rowClass="rowClass"
          >
            <template #col-subtotalTwd="{ row }">{{ formatTwd(row.subtotalTwd) }}</template>
            <template #col-orderStatusName="{ row }">
              <span class="status-badge" :class="`status-${row.orderStatus}`">{{ row.orderStatusName }}</span>
            </template>
          </TableComponent>

          <p class="contact-hint">
          ** 若有任何疑問，歡迎私訊官方詢問 **</p>
        </div>
      </template>

      <div v-else class="state-msg">目前尚無訂單資料</div>
    </div>
  </div>
</template>

<style scoped>
.query-page {
  min-height: 100dvh;
  background: var(--color-background, #f5f5f5);
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.query-card {
  width: 100%;
  max-width: 860px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--color-text-secondary);
}

/* ── 全部活動總金額 ── */
.total-banner {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.total-banner-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted, #aaa);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.total-banner-value {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.total-banner-breakdown {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--color-text-muted, #aaa);
  margin-top: 0.35rem;
}

.sep {
  color: var(--color-text-muted, #ccc);
}

.total-banner-sub {
  font-size: 0.8rem;
  color: var(--color-text-muted, #aaa);
  margin-top: 0.2rem;
}

/* ── 活動頁籤（segmented control 風格） ── */
.tab-bar {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  background: color-mix(in srgb, var(--color-border) 50%, transparent);
  padding: 0.3rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  width: fit-content;
  max-width: 100%;
}

.tab-btn {
  padding: 0.4rem 1.1rem;
  border: none;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-muted, #888);
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  white-space: nowrap;

  &:hover {
    color: var(--color-text);
  }

  &.active {
    background: var(--color-surface);
    color: var(--color-primary);
    font-weight: 700;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  }
}

/* ── 活動內容面板 ── */
.tab-panel {
  background: var(--color-surface);
  border-radius: 14px;
  padding: 1.25rem 1.25rem 0.75rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.tab-panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.tab-panel-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text);
}

.tab-panel-total {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  font-size: 0.8rem;
  color: var(--color-text-muted, #aaa);
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  border-radius: 8px;
  padding: 0.35rem 0.75rem;

  .packaging {
    color: var(--color-text-muted, #aaa);
  }

  strong {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--color-primary);
  }
}

.tab-panel-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.2rem;
}

.query-time {
  font-size: 0.72rem;
  color: var(--color-text-muted, #bbb);
}

/* ── 提示字 ── */
.contact-hint {
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-muted, #aaa);
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

/* ── 狀態徽章 ── */
.status-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;

  /* 已喊單 */
  &.status-1 {
    background: color-mix(in srgb, #6b7280 12%, transparent);
    color: #6b7280;
  }

  /* 已購買 */
  &.status-2 {
    background: color-mix(in srgb, #16a34a 12%, transparent);
    color: #16a34a;
  }

  /* 已取消 */
  &.status-3 {
    background: color-mix(in srgb, #9ca3af 12%, transparent);
    color: #9ca3af;
    text-decoration: line-through;
  }

  /* 缺貨 */
  &.status-4 {
    background: color-mix(in srgb, var(--color-danger, #e53e3e) 12%, transparent);
    color: var(--color-danger, #e53e3e);
  }
}

/* ── 狀態訊息 ── */
.state-msg {
  color: var(--color-text-muted, #aaa);
  font-size: 0.9rem;
  padding: 2rem 0;
  text-align: center;

  &.error {
    color: var(--color-danger, #e53e3e);
  }
}
</style>
