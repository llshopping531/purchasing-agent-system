<script setup lang="ts">
/**
 * 通販國際運費計算 - 詳細頁
 */
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { useSecondSupplementStore } from '@/stores/secondSupplement'
import { formatTwd } from '@/utils/format'
import { PATH } from '@/constants/route.constant'

const router = useRouter()
const route = useRoute()
const store = useSecondSupplementStore()

const bill = computed(() => store.getById(Number(route.params.id)))

const productWeightG = computed(() =>
  bill.value?.orders.reduce((sum, o) => sum + o.weightG, 0) ?? 0,
)
const boxWeightG = computed(() =>
  (bill.value?.totalWeightG ?? 0) - productWeightG.value,
)

onMounted(() => {
  if (!bill.value) router.replace(PATH.onlineSecondSupplement)
})

function goEdit() {
  router.push(`${PATH.onlineSecondSupplement}/${route.params.id}/edit`)
}

const headerRow: HeaderRow[] = [
  { name: '客戶名稱', value: 'customerName', sort: 0, width: '130px' },
  { name: '商品名稱', value: 'productName', sort: 1 },
  { name: '數量', value: 'quantity', sort: 2, width: '70px' },
  { name: '重量（g）', value: 'weightG', sort: 3, width: '100px' },
  { name: '國際運費', value: 'shippingFee', sort: 4, width: '110px' },
  { name: '備註', value: 'note', sort: 5 },
]
</script>

<template>
  <div v-if="bill" class="detail-page">

    <!-- 頁首 -->
    <div class="detail-header">
      <button class="back-btn" @click="router.push(PATH.onlineSecondSupplement)">← 返回</button>
      <div class="header-main">
        <h3 class="page-title">{{ bill.name }}</h3>
        <span class="created-at">{{ bill.createdAt }}</span>
      </div>
      <button class="edit-btn" @click="goEdit">編輯</button>
    </div>

    <!-- 基本資訊 -->
    <div class="section-card">
      <div class="info-row">
        <div class="info-item">
          <span class="info-label">國境運費總額</span>
          <span class="info-value">{{ formatTwd(bill.internationalShippingTotal) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">每公斤金額</span>
          <span class="info-value">{{ formatTwd(bill.pricePerKg) }} / kg</span>
        </div>
        <div class="info-item">
          <span class="info-label">總重量</span>
          <span class="info-value">{{ bill.totalWeightG.toLocaleString() }} g</span>
        </div>
        <div class="info-item">
          <span class="info-label">商品總重量</span>
          <span class="info-value">{{ productWeightG.toLocaleString() }} g</span>
        </div>
        <div class="info-item">
          <span class="info-label">箱子總重量</span>
          <span class="info-value">{{ boxWeightG.toLocaleString() }} g</span>
        </div>
      </div>
      <div class="info-item">
        <span class="info-label">加入活動</span>
        <div class="event-chips">
          <span v-for="e in bill.eventNames" :key="e" class="event-chip">{{ e }}</span>
        </div>
      </div>
    </div>

    <!-- 訂單列表 -->
    <div class="section-card">
      <div class="card-label">訂單明細</div>
      <div v-if="bill.orders.length === 0" class="empty">尚無訂單資料</div>
      <table-component
        v-else
        :headerRow="headerRow"
        :tableData="bill.orders"
        :isEdit="false"
        :isDelete="false"
        :totalPages="1"
        :currentPage="0"
        :totalElements="bill.orders.length"
      >
        <template #col-shippingFee="{ row }">
          {{ formatTwd(row.shippingFee) }}
        </template>
      </table-component>
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

.info-row {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.event-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.1rem;
}

.event-chip {
  padding: 0.2rem 0.65rem;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
  color: var(--color-secondary-dark, var(--color-secondary));
  border: 1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
}

.empty {
  padding: 2rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
</style>
