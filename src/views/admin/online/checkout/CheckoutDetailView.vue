<script setup lang="ts">
/**
 * 通販結帳單 - 詳細頁
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CheckoutTable from '@/components/tables/CheckoutTable.vue'
import { useCheckoutStore } from '@/stores/checkout'
import { checkoutApi } from '@/services/api/online/checkout/checkout-api'
import { formatTwd } from '@/utils/format'
import { PATH } from '@/constants/route.constant'

const router = useRouter()
const route = useRoute()
const checkoutStore = useCheckoutStore()

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  '已收款': { background: '#dcfce7', color: '#16a34a' },
  '收款中': { background: '#fef9c3', color: '#a16207' },
  '未收款': { background: '#f1f5f9', color: '#94a3b8' },
}

const bill = computed(() => checkoutStore.getById(Number(route.params.id)))
const grandTotal = computed(() =>
  bill.value?.rows.reduce((sum, r) => sum + r._totalAmount, 0) ?? 0,
)

const isSaving = ref(false)
const isSaved = ref(false)

onMounted(() => {
  if (!bill.value) router.replace(PATH.checkout)
})

function goEdit() {
  router.push(`${PATH.checkout}/${route.params.id}/edit`)
}

async function saveReconciliation() {
  if (!bill.value) return
  isSaving.value = true
  isSaved.value = false
  try {
    await checkoutApi.saveReconciliation(bill.value.id, {
      rows: bill.value.rows.map((r) => ({
        customerName: r.customerName,
        remainingAmount: r.remainingAmount,
        remitted: r.remitted,
        reconciled: r.reconciled,
      })),
    })
    isSaved.value = true
    setTimeout(() => { isSaved.value = false }, 2000)
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div v-if="bill" class="detail-page">

    <!-- 頁首 -->
    <div class="detail-header">
      <button class="back-btn" @click="router.push(PATH.checkout)">← 返回</button>
      <div class="header-main">
        <h3 class="page-title">{{ bill.name }}</h3>
        <span class="created-at">截止 {{ bill.deadline }}</span>
        <span class="status-badge" :style="STATUS_STYLE[bill.status]">{{ bill.status }}</span>
      </div>
      <button class="edit-btn" @click="goEdit">編輯</button>
    </div>

    <!-- 活動標籤 -->
    <div class="section-card">
      <div class="event-chips">
        <span v-for="name in bill.eventNames" :key="name" class="event-chip">{{ name }}</span>
      </div>
    </div>

    <!-- 摘要 -->
    <div class="summary-row">
      <div class="summary-item">
        <span class="summary-num">{{ bill.rows.length }}</span>
        <span class="summary-desc">位顧客</span>
      </div>
      <div class="summary-sep">·</div>
      <div class="summary-item">
        <span class="summary-num total-num">{{ formatTwd(grandTotal) }}</span>
        <span class="summary-desc">總合計</span>
      </div>
    </div>

    <!-- 結帳單表格 -->
    <div class="section-card">
      <div class="card-label">結帳明細</div>
      <checkout-table :rows="bill.rows" />
    </div>

    <!-- 底部操作 -->
    <div class="form-footer">
      <button
        class="confirm-btn"
        :class="{ 'confirm-btn--saved': isSaved }"
        :disabled="isSaving"
        @click="saveReconciliation"
      >
        {{ isSaved ? '已儲存' : isSaving ? '儲存中…' : '確認' }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.detail-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 2rem;
}

/* ── 頁首 ── */
.detail-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.header-main {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
}

.created-at {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.status-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.15rem 0.6rem;
  border-radius: 99px;
  white-space: nowrap;
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
  white-space: nowrap;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  }
}

.edit-btn {
  padding: 0.35rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 8px;
  border: 1.5px solid var(--color-primary);
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  color: var(--color-primary);
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 16%, transparent);
  }
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.confirm-btn {
  padding: 0.35rem 1.1rem;
  font-size: 0.82rem;
  font-weight: 700;
  border-radius: 8px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s, background 0.15s;

  &:hover:not(:disabled) {
    opacity: 0.88;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &--saved {
    background: #16a34a;
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
  gap: 0.75rem;
}

.card-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

/* ── 活動標籤 ── */
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

/* ── 摘要 ── */
.summary-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 0.25rem;
}

.summary-item {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.summary-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1;
}

.total-num {
  color: var(--color-primary);
}

.summary-desc {
  font-size: 0.82rem;
  color: var(--color-text-muted);
}

.summary-sep {
  color: var(--color-text-muted);
  font-size: 1rem;
}
</style>
