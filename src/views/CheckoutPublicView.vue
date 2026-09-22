<script setup lang="ts">
/**
 * 公開結帳單查詢頁
 * 透過 URL 中的 queryUuid 查詢結帳單明細，不需登入
 */
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import CheckoutTable, { type CheckoutRowData } from '@/components/tables/CheckoutTable.vue'
import { checkoutApi } from '@/services/api/online/checkout/checkout-api'
import type {
  PublicCheckoutBillRes,
  CheckoutRowRes,
} from '@/services/api/online/checkout/checkout-api-interfaces'

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  已收款: { background: '#dcfce7', color: '#16a34a' },
  收款中: { background: '#fef9c3', color: '#a16207' },
  未收款: { background: '#f1f5f9', color: '#94a3b8' },
}

const route = useRoute()

const now = new Date()

const bill = ref<PublicCheckoutBillRes | null>(null)
const isLoading = ref(true)
const isError = ref(false)

/** 將後端結帳單明細列轉為表格用資料（附上前端計算的數值合計） */
function toRowData(row: CheckoutRowRes): CheckoutRowData {
  const totalAmount = row.eventList.reduce(
    (sum, ev) => sum + ev.items.reduce((s, item) => s + item.itemTotal, 0),
    0,
  )
  return { ...row, _totalAmount: totalAmount }
}

const rows = computed(() => (bill.value?.rows ?? []).map(toRowData))

const nameFilter = ref('')
const filteredRows = computed(() => {
  const keyword = nameFilter.value.trim().toLowerCase()
  if (!keyword) return rows.value
  return rows.value.filter((row) => row.customerName.toLowerCase().includes(keyword))
})

onMounted(async () => {
  const uuid = route.params.uuid as string
  try {
    bill.value = await checkoutApi.getPublicCheckoutBill(uuid)
  } catch {
    isError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="checkout-public-page">
    <div class="checkout-public-card">
      <div v-if="isLoading" class="state-msg">載入中…</div>

      <div v-else-if="isError" class="state-msg error">查無資料，請確認連結是否正確</div>

      <template v-else-if="bill">
        <div class="page-header">
          <h2 class="page-title">{{ bill.name }}</h2>
          <span class="deadline"
            >截止 <span class="date">{{ bill.deadline }}</span></span
          >
          <span class="status-badge" :style="STATUS_STYLE[bill.status]">{{ bill.status }}</span>
        </div>

        <div class="event-chips">
          <span v-for="name in bill.eventNames" :key="name" class="event-chip">{{ name }}</span>
        </div>

        <div class="filter-bar">
          <input class="filter-input" v-model="nameFilter" placeholder="輸入姓名篩選…" />
          <span class="query-time">查詢時間 {{ now.toLocaleString('zh-TW') }}</span>
        </div>

        <div v-if="filteredRows.length === 0" class="state-msg">查無符合的姓名</div>
        <checkout-table v-else :rows="filteredRows" :interactive="false" :show-note="false" />

        <p class="contact-hint">** 若有任何疑問，歡迎私訊官方詢問 **</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.checkout-public-page {
  min-height: 100dvh;
  background: var(--color-background, #f5f5f5);
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.checkout-public-card {
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
}

.deadline {
  font-size: 0.85em;
  color: var(--color-danger);
  .date {
    font-size: 1.5rem;
    font-weight: bold;
  }
}

.status-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.6rem;
  border-radius: 99px;
  white-space: nowrap;
}

.event-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.event-chip {
  padding: 0.2rem 0.65rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  color: var(--color-primary);
}

.query-time {
  font-size: 0.72rem;
  color: var(--color-text-muted, #bbb);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: end;
  .filter-input {
    max-width: 320px;
  }
}

.filter-input {
  width: 100%;
  padding: 0.5rem 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.875rem;
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-muted, #aaa);
  }
}

.contact-hint {
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-muted, #aaa);
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

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
