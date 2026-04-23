<script setup lang="ts">
/**
 * 公開訂單查詢頁
 * 透過 URL 中的 queryUuid 查詢該客戶的充實後訂單列表，不需登入
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { queryApi } from '@/services/api/query/query-api'
import { formatTwd, formatJpy } from '@/utils/format'
import type { QueryOrderEnriched } from '@/services/api/query/query-api-interfaces'

const route = useRoute()

const orders = ref<QueryOrderEnriched[]>([])
const isLoading = ref(true)
const isError = ref(false)

/** 依活動 ID 分組的訂單 */
const groupedOrders = computed(() => {
  const map = new Map<number, QueryOrderEnriched[]>()
  for (const order of orders.value) {
    const list = map.get(order.eventId) ?? []
    list.push(order)
    map.set(order.eventId, list)
  }
  return map
})

/** 已購買訂單的台幣總金額 */
const totalTwd = computed(() =>
  orders.value
    .filter((o) => o.orderStatusName === '已購買')
    .reduce((sum, o) => sum + o.subtotalTwd, 0),
)

/** 已購買訂單的日幣總金額 */
const totalJpy = computed(() =>
  orders.value
    .filter((o) => o.orderStatusName === '已購買')
    .reduce((sum, o) => sum + o.subtotalJpy, 0),
)

onMounted(async () => {
  const uuid = route.params.uuid as string
  console.log(route.params)
  try {
    orders.value = await queryApi.getOrdersWithEnrichment(uuid)
    console.log(orders.value)
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
      <h2 class="page-title">我的訂單查詢</h2>

      <div v-if="isLoading" class="state-msg">載入中…</div>

      <div v-else-if="isError" class="state-msg error">查無資料，請確認連結是否正確</div>

      <template v-else-if="orders.length > 0">
        <!-- 總金額摘要 -->
        <div class="summary">
          <div class="summary-item">
            <span class="summary-label">已購買日幣總計</span>
            <span class="summary-value">{{ formatJpy(totalJpy) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">已購買台幣總計</span>
            <span class="summary-value">{{ formatTwd(totalTwd) }}</span>
          </div>
        </div>

        <!-- 依活動分組顯示 -->
        <div
          v-for="[eventId, list] in groupedOrders"
          :key="eventId"
          class="event-group"
        >
          <div class="event-label">活動 #{{ eventId }}</div>
          <div class="table-wrap">
            <table class="order-table">
              <thead>
                <tr>
                  <th>通路</th>
                  <th>商品名稱</th>
                  <th class="num">數量</th>
                  <th class="num">日幣小計</th>
                  <th class="num">台幣小計</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(order, i) in list"
                  :key="i"
                  :class="{ inactive: order.orderStatusName !== '已購買' }"
                >
                  <td>{{ order.channelName }}</td>
                  <td>{{ order.productName }}</td>
                  <td class="num">{{ order.quantity }}</td>
                  <td class="num">{{ formatJpy(order.subtotalJpy) }}</td>
                  <td class="num">{{ formatTwd(order.subtotalTwd) }}</td>
                  <td>
                    <span class="status-badge" :class="order.orderStatus">
                      {{ order.orderStatusName }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

/* ── 摘要區塊 ── */
.summary {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-md, 8px);
  padding: 0.5rem 1rem;
  min-width: 160px;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-weight: 600;
}

.summary-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* ── 活動分組 ── */
.event-group {
  margin-bottom: 2rem;
}

.event-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted, #888);
  margin-bottom: 0.5rem;
  padding-left: 0.25rem;
  border-left: 3px solid var(--color-primary);
  padding-left: 0.5rem;
}

/* ── 表格 ── */
.table-wrap {
  overflow-x: auto;
  border-radius: var(--radius-md, 8px);
  border: 1.5px solid var(--color-border);
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th {
    background: var(--color-surface);
    padding: 0.6rem 0.875rem;
    text-align: left;
    font-weight: 600;
    color: var(--color-text-secondary);
    border-bottom: 1.5px solid var(--color-border);
    white-space: nowrap;
  }

  td {
    padding: 0.55rem 0.875rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr.inactive td {
    opacity: 0.45;
  }

  .num {
    text-align: right;
  }
}

/* ── 狀態徽章 ── */
.status-badge {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
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
