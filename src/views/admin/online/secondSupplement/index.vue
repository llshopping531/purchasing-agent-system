<script setup lang="ts">
/**
 * 通販國際運費計算頁面
 */
import { ref, computed } from 'vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import SecondSupplementFormModal from './SecondSupplementFormModal.vue'
import type { SelectOption } from '@/interfaces/common'
import { formatTwd } from '@/utils/format'

const formModalRef = ref<InstanceType<typeof SecondSupplementFormModal>>()

// ── 假資料（TODO: 替換為 API） ─────────────────────────────────

interface SupplementOrder {
  id: number
  customerName: string
  productName: string
  quantity: number
  weightG: number
  shippingFee: number
  note: string
}

interface SupplementDetail {
  id: number
  name: string
  events: string[]
  internationalShippingTotal: number
  pricePerKg: number
  totalWeightG: number
  orders: SupplementOrder[]
}

const mockDetails: Record<number, SupplementDetail> = {
  1: {
    id: 1,
    name: '2024-11 二補單',
    events: ['2024-11 通販活動 A', '2024-11 通販活動 B'],
    internationalShippingTotal: 675,
    pricePerKg: 150,
    totalWeightG: 4500,
    orders: [
      { id: 1, customerName: '王小明', productName: '商品 A', quantity: 1, weightG: 500, shippingFee: 91, note: '' },
      { id: 2, customerName: '李小花', productName: '商品 B', quantity: 2, weightG: 1200, shippingFee: 438, note: '' },
      { id: 3, customerName: '陳大文', productName: '商品 C', quantity: 1, weightG: 800, shippingFee: 146, note: '易碎' },
    ],
  },
  2: {
    id: 2,
    name: '2024-12 二補單',
    events: ['2024-12 通販活動 A'],
    internationalShippingTotal: 1050,
    pricePerKg: 150,
    totalWeightG: 7000,
    orders: [
      { id: 4, customerName: '張美麗', productName: '商品 D', quantity: 3, weightG: 2000, shippingFee: 1050, note: '' },
    ],
  },
  3: {
    id: 3,
    name: '2025-01 二補單',
    events: ['2025-01 通販活動 A', '2025-01 通販活動 B', '2025-01 通販活動 C'],
    internationalShippingTotal: 0,
    pricePerKg: 160,
    totalWeightG: 0,
    orders: [],
  },
}

// ── 下拉 ───────────────────────────────────────────────────────

const supplementOptions = ref<SelectOption<number | null>[]>([
  { name: '請選擇二補單', value: null },
  { name: '2024-11 二補單', value: 1 },
  { name: '2024-12 二補單', value: 2 },
  { name: '2025-01 二補單', value: 3 },
])

const selectedId = ref<number | null>(null)

const detail = computed<SupplementDetail | null>(() =>
  selectedId.value !== null ? (mockDetails[selectedId.value] ?? null) : null,
)

function onSelectSupplement(option: SelectOption<number | null>) {
  selectedId.value = option.value
}

// ── 表格 ───────────────────────────────────────────────────────

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
  <div class="second-supplement">
    <h3>國際運費計算</h3>

    <div class="toolbar">
      <div class="select-box">
        <select-component
          label="二補單"
          :optionList="supplementOptions"
          :defaultValue="supplementOptions[0]"
          @selectOption="onSelectSupplement"
        />
      </div>
      <div class="btn-box">
        <div class="btn" @click="formModalRef?.open()">新增二補單</div>
      </div>
    </div>

    <template v-if="detail">
      <!-- 基本資訊 -->
      <div class="info-card">
        <div class="info-card-header">
          <button class="edit-btn" @click="formModalRef?.edit(detail!)">編輯</button>
        </div>
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">名稱</span>
            <span class="info-value">{{ detail.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">國境運費總額</span>
            <span class="info-value">{{ formatTwd(detail.internationalShippingTotal) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">每公斤金額</span>
            <span class="info-value">{{ formatTwd(detail.pricePerKg) }} / kg</span>
          </div>
          <div class="info-item">
            <span class="info-label">總重量</span>
            <span class="info-value">{{ detail.totalWeightG.toLocaleString() }} g</span>
          </div>
          <div class="info-item">
            <span class="info-label">商品總重量</span>
            <span class="info-value">{{ detail.orders.reduce((sum, o) => sum + o.weightG, 0).toLocaleString() }} g</span>
          </div>
          <div class="info-item">
            <span class="info-label">箱子總重量</span>
            <span class="info-value">{{ (detail.totalWeightG - detail.orders.reduce((sum, o) => sum + o.weightG, 0)).toLocaleString() }} g</span>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">加入活動</span>
          <div class="event-tags">
            <span v-for="e in detail.events" :key="e" class="event-tag">{{ e }}</span>
          </div>
        </div>
      </div>

      <!-- 訂單列表 -->
      <table-component
        :headerRow="headerRow"
        :tableData="detail.orders"
        :isEdit="false"
        :isDelete="false"
        :totalPages="1"
        :currentPage="0"
        :totalElements="detail.orders.length"
      >
        <template #col-shippingFee="{ row }">
          {{ formatTwd(row.shippingFee) }}
        </template>
      </table-component>
    </template>

    <second-supplement-form-modal ref="formModalRef" />
  </div>
</template>

<style scoped>
.second-supplement {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.toolbar {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.select-box {
  width: 220px;
}

.btn-box {
  display: flex;
  gap: 0.75rem;
}

.info-card {
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.info-card-header {
  display: flex;
  justify-content: flex-end;
}

.edit-btn {
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
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

.event-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.1rem;
}

.event-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.6rem;
  border-radius: 99px;
  font-size: 0.78rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
  color: var(--color-secondary-dark, var(--color-secondary));
  border: 1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
}
</style>
