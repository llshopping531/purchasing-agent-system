<script setup lang="ts">
/**
 * 活動結算訊息產生器
 * 選取活動後自動載入顧客清單與訂單金額，透過可自訂模板批量產生付款訊息
 */
import { ref, computed, watch } from 'vue'
import { formatTwd } from '@/utils/format'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { packingListApi } from '@/services/api/offline/packing-list/packing-list-api'
import { statsApi } from '@/services/api/offline/stats/stats-api'
import type { PackingListCustomer } from '@/services/api/offline/packing-list/packing-list-api-interfaces'
import type { CustomerRankingItem } from '@/services/api/offline/stats/stats-api-interfaces'
import type { EventsResBase } from '@/services/api/offline/events/events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { customersApi } from '@/services/api/offline/customers/customers-api'

const PACKAGING_FEE = 10

const selectedEvent = ref<EventsResBase | null>(null)
const customers = ref<PackingListCustomer[]>([])
const customerTotalMap = ref<Map<number, number>>(new Map())
const isLoading = ref(false)
const selectedCustomer = ref<PackingListCustomer | null>(null)
const selectedCustomerOption = ref<SelectOption<PackingListCustomer> | undefined>(undefined)
const isCopied = ref(false)

const customerOptions = computed<SelectOption<PackingListCustomer>[]>(() =>
  customers.value.map((c) => {
    const total = customerTotalMap.value.get(c.id) ?? 0
    return {
      name: `${c.name}（${formatTwd(total)}）`,
      value: c,
      strikethrough: total === 0,
    }
  }),
)

function onSelectCustomer(opt: SelectOption<PackingListCustomer>) {
  selectedCustomerOption.value = opt
  selectedCustomer.value = opt.value
}

// ── 模板 ───────────────────────────────────────────────────────
const defaultTemplate = `您好 {{customerName}}，非常感謝參與本次連線代購❤️
本次 {{eventName}} 代購消費金額共 {{totalWithFee}}（含 $10 元包材費）。

➜ 匯款金額為 {{remittance}}（已扣除預留$20賣貨便金額，無需再自行扣除）
➜ 匯款期限為 {{deadline}}
❗️$760以下可直接填寫付款表單，勾選取付選項

📍詳細購物清單請查看此連結🔗
{{queryLink}}
📍確認完畢後麻煩填寫付款表單（匯款資訊在表單內）
{{formLink}}

若有任何問題歡迎提問唷
再次感謝本次的跟團（｡･ω･｡）`

const textareaRef = ref<HTMLTextAreaElement>()
const template = ref(defaultTemplate)
const hasSavedTemplate = ref(false)

function getStorageKey(eventId: number) {
  return `settlement-template-event-${eventId}`
}

watch(selectedEvent, (ev) => {
  if (!ev) return
  const saved = localStorage.getItem(getStorageKey(ev.id))
  hasSavedTemplate.value = saved !== null
  template.value = saved ?? defaultTemplate
})

watch(template, (val) => {
  if (selectedEvent.value) {
    localStorage.setItem(getStorageKey(selectedEvent.value.id), val)
    hasSavedTemplate.value = true
  }
})

function resetTemplate() {
  template.value = defaultTemplate
  if (selectedEvent.value) {
    localStorage.removeItem(getStorageKey(selectedEvent.value.id))
    hasSavedTemplate.value = false
  }
}

// ── 自動填入參數 ───────────────────────────────────────────────
const AUTO_TOKENS = [
  'customerName',
  'eventName',
  'totalTwd',
  'totalWithFee',
  'remittance',
  'queryLink',
]

const autoParams = [
  { label: '顧客名稱', token: '{{customerName}}' },
  { label: '活動名稱', token: '{{eventName}}' },
  { label: '消費金額', token: '{{totalTwd}}' },
  { label: '含包材金額', token: '{{totalWithFee}}' },
  { label: '匯款金額', token: '{{remittance}}' },
  { label: '查詢連結', token: '{{queryLink}}' },
]

// ── 自訂全域參數（從模板偵測未知 token） ──────────────────────
const customTokens = computed<string[]>(() => {
  const matches = [...template.value.matchAll(/\{\{([\w\u4e00-\u9fff$/.@\- ]+)\}\}/g)]
  const all = [...new Set(matches.map((m) => (m[1] as string).trim()))]
  return all.filter((t) => !AUTO_TOKENS.includes(t))
})

const globalValues = ref<Record<string, string>>({})

watch(
  customTokens,
  (tokens) => {
    const next: Record<string, string> = {}
    for (const t of tokens) {
      next[t] = globalValues.value[t] ?? ''
    }
    globalValues.value = next
  },
  { immediate: true },
)

// ── 插入游標 ───────────────────────────────────────────────────
function insertToken(token: string) {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  template.value = template.value.slice(0, start) + token + template.value.slice(end)
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + token.length, start + token.length)
  })
}

// ── 活動選取 / 資料載入 ────────────────────────────────────────
async function onEventSelect(data: SelectOption<EventsResBase | null>) {
  if (!data.value) return
  const event = data.value
  selectedEvent.value = event
  isLoading.value = true
  customers.value = []
  customerTotalMap.value = new Map()

  try {
    const [list, ranking] = await Promise.all([
      packingListApi.getCustomers({ eventId: event.id }),
      statsApi.getCustomerRanking({ eventId: event.id }),
    ])
    customers.value = list
    customerTotalMap.value = new Map(
      ranking.map((r: CustomerRankingItem) => [r.customerId, r.totalTwd]),
    )
    const first = customers.value[0] ?? null
    selectedCustomer.value = first
    selectedCustomerOption.value = first
      ? {
          name: `${first.name}（${formatTwd(customerTotalMap.value.get(first.id) ?? 0)}）`,
          value: first,
        }
      : undefined
  } finally {
    isLoading.value = false
  }
}

// ── 總收款額（所有顧客加總） ───────────────────────────────────
const totalRevenue = computed(() => {
  let sum = 0
  for (const val of customerTotalMap.value.values()) sum += val
  return sum
})

const zeroAmountCount = computed(() =>
  customers.value.filter((c) => (customerTotalMap.value.get(c.id) ?? 0) === 0).length
)

const totalPackagingFee = computed(() =>
  (customers.value.length - zeroAmountCount.value) * PACKAGING_FEE
)
const grandTotal = computed(() => totalRevenue.value + totalPackagingFee.value)

// ── 取得每位顧客已購買金額 ─────────────────────────────────────
function getCustomerTotal(customerId: number): number {
  return customerTotalMap.value.get(customerId) ?? 0
}

// ── 渲染個人訊息 ──────────────────────────────────────────────
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function renderForCustomer(customer: PackingListCustomer): Promise<string> {
  const total = getCustomerTotal(customer.id)
  const queryUuid = await customersApi.getQueryUuid(customer.id)
  const queryLink = `${window.location.origin}/query/${queryUuid}?tab=${selectedEvent.value?.id ?? ''}`

  let text = template.value
  text = text.replace(/\{\{customerName\}\}/g, customer.name)
  text = text.replace(/\{\{eventName\}\}/g, selectedEvent.value?.name ?? '')
  text = text.replace(/\{\{totalTwd\}\}/g, formatTwd(total))
  text = text.replace(/\{\{totalWithFee\}\}/g, formatTwd(total > 0 ? total + PACKAGING_FEE : 0))
  text = text.replace(/\{\{remittance\}\}/g, formatTwd(total > 0 ? total - 10 : 0))
  text = text.replace(/\{\{queryLink\}\}/g, queryLink)

  for (const [key, val] of Object.entries(globalValues.value)) {
    text = text.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g'), val)
  }

  return text
}

// ── 渲染結果（解決 async 在 template 無法直接顯示的問題） ──────
const renderedMessage = ref('')

watch(
  [selectedCustomer, template, globalValues],
  async () => {
    if (selectedCustomer.value) {
      renderedMessage.value = await renderForCustomer(selectedCustomer.value)
    } else {
      renderedMessage.value = ''
    }
  },
  { deep: true, immediate: true },
)

// ── 複製當前訊息 ──────────────────────────────────────────────
async function copyMessage() {
  if (!renderedMessage.value) return
  await navigator.clipboard.writeText(renderedMessage.value)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 1500)
}

const isSettlementModalOpen = ref(false)
const isListCopied = ref(false)

function openSettlementModal() {
  isSettlementModalOpen.value = true
}

async function copySettlementList() {
  const lines: string[] = []
  settlementTableData.value.forEach((r, i) => {
    if (i > 0 && i % 50 === 0) lines.push('')
    lines.push(`${r.name}\t${r.totalTwd}\t${r.grandTotal}`)
  })
  await navigator.clipboard.writeText(lines.join('\n'))
  isListCopied.value = true
  setTimeout(() => { isListCopied.value = false }, 1500)
}

const settlementHeaders: HeaderRow[] = [
  { name: '顧客', value: 'name', sort: 0 },
  { name: '商品金額', value: 'totalTwd', sort: 1 },
  { name: '含包材', value: 'grandTotal', sort: 2 },
  { name: '備註', value: 'remark', sort: 3 },
]

const settlementTableData = computed(() =>
  [...customers.value]
    .sort((a, b) => {
      const aTotal = customerTotalMap.value.get(a.id) ?? 0
      const bTotal = customerTotalMap.value.get(b.id) ?? 0
      return (aTotal === 0 ? 1 : 0) - (bTotal === 0 ? 1 : 0)
    })
    .map((c) => {
      const total = customerTotalMap.value.get(c.id) ?? 0
      const remark =
        total === 0 ? '金額為 $0' :
        total > 10000 ? '金額超過萬元' :
        total > 8000 ? '金額超過 $8,000' : ''
      return { name: c.name, totalTwd: formatTwd(total), grandTotal: formatTwd(total > 0 ? total + PACKAGING_FEE : 0), remark }
    })
)
</script>

<template>
  <div class="settlement-page">
    <!-- 頁首 -->
    <h2 class="page-title">活動結算</h2>
    <div class="event-select-wrap">
      <event-select-component @selectOption="onEventSelect" />
    </div>
    <div v-if="selectedEvent">
      <div></div>
      <p>
        總收款金額:{{ formatTwd(totalRevenue) }} + {{ formatTwd(totalPackagingFee) }} 包材費 =
        {{ formatTwd(grandTotal) }}
      </p>
      <p>總人數:{{ customers.length }}<span v-if="zeroAmountCount > 0">（{{ zeroAmountCount }} 人訂單為 $ 0）</span></p>
      <div>
        <button class="list-btn" @click="openSettlementModal">顯示名單</button>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-if="!selectedEvent" class="empty-state">
      <div class="empty-icon">💳</div>
      <div class="empty-text">請先選取活動以載入顧客清單</div>
    </div>

    <template v-else>
      <!-- 工具列：參數 + 全域變數 -->
      <div class="toolbar-card">
        <!-- 自動填入參數 -->
        <div class="token-section">
          <div class="token-label">自動填入</div>
          <div class="token-chips">
            <button
              v-for="p in autoParams"
              :key="p.token"
              class="token-chip auto"
              :title="p.token"
              @click="insertToken(p.token)"
            >
              {{ p.label }}
            </button>
          </div>
        </div>

        <!-- 自訂全域參數 -->
        <div v-if="customTokens.length > 0" class="token-section">
          <div class="token-label">全域變數（來自模板）</div>
          <div class="global-fields">
            <label v-for="t in customTokens" :key="t" class="global-field">
              <span class="global-field-name">{{ t }}</span>
              <input
                class="global-field-input"
                v-model="globalValues[t]"
                :placeholder="`填入 ${t}`"
              />
            </label>
          </div>
        </div>
      </div>

      <!-- 主體：模板 + 訊息清單 -->
      <div class="main-panel">
        <!-- 左：模板編輯 -->
        <div class="panel editor-panel">
          <div class="panel-header">
            <span class="panel-title">模板編輯</span>
            <span v-if="hasSavedTemplate" class="saved-badge">已儲存</span>
            <button class="reset-btn" @click="resetTemplate">↩ 回到預設</button>
          </div>
          <textarea
            ref="textareaRef"
            class="template-area"
            v-model="template"
            placeholder="在此輸入訊息模板，支援 {{token}} 語法…"
          />
          <div class="template-hint">
            模板會依每位顧客各自渲染一份，&#123;&#123;token&#125;&#125; 可插入自動或全域變數
          </div>
        </div>

        <!-- 右：付款訊息 -->
        <div class="panel messages-panel">
          <div class="panel-header">
            <span class="panel-title">
              付款訊息
              <span
                v-if="selectedCustomer && getCustomerTotal(selectedCustomer.id) === 0"
                class="amount-badge zero-badge"
              >金額為 $0</span>
              <span
                v-else-if="selectedCustomer && getCustomerTotal(selectedCustomer.id) > 10000"
                class="amount-badge over10k-badge"
              >金額超過萬元</span>
              <span
                v-else-if="selectedCustomer && getCustomerTotal(selectedCustomer.id) > 8000"
                class="amount-badge over8k-badge"
              >金額超過 $8,000</span>
            </span>
            <span v-if="isLoading" class="loading-hint">載入中…</span>
            <div v-else-if="customers.length > 0" class="customer-select-wrap">
              <select-component
                label="顧客"
                :isDisplayLable="false"
                :defaultValue="selectedCustomerOption"
                :optionList="customerOptions"
                @selectOption="onSelectCustomer"
              />
            </div>
            <button
              class="copy-btn"
              :class="{ copied: isCopied }"
              :disabled="!renderedMessage || isLoading"
              @click="copyMessage"
            >
              {{ isCopied ? '已複製' : '複製' }}
            </button>
          </div>

          <div class="messages-body">
            <div v-if="isLoading" class="list-loading">載入顧客資料中…</div>
            <div v-else-if="customers.length === 0" class="list-empty">此活動尚無顧客訂單資料</div>
            <pre v-else-if="selectedCustomer" class="message-preview">{{ renderedMessage }}</pre>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- 名單彈窗 -->
  <modal-component
    v-if="isSettlementModalOpen"
    :name="`${selectedEvent?.name ?? ''} 收款名單`"
    width="600px"
    @confirm="isSettlementModalOpen = false"
    @cancel="isSettlementModalOpen = false"
  >
    <template #content>
      <div class="settlement-modal-toolbar">
        <button
          class="copy-btn"
          :class="{ copied: isListCopied }"
          @click="copySettlementList"
        >
          {{ isListCopied ? '已複製' : '複製名單' }}
        </button>
      </div>
      <table-component
        :headerRow="settlementHeaders"
        :tableData="settlementTableData"
        :isEdit="false"
        :isDelete="false"
      >
        <template #col-remark="{ row }">
          <span
            v-if="row.remark"
            class="remark-badge"
            :class="{
              'remark-zero': row.remark === '金額為 $0',
              'remark-over10k': row.remark === '金額超過萬元',
              'remark-over8k': row.remark === '金額超過 $8,000',
            }"
          >{{ row.remark }}</span>
        </template>
      </table-component>
    </template>
  </modal-component>
</template>

<style scoped>
.settlement-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 2rem;
}

/* ── 頁首 ── */

.page-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  white-space: nowrap;
}

.event-select-wrap {
  flex: 1;
  min-width: 220px;
  max-width: 320px;
}

/* ── 顯示名單按鈕 ── */
.list-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: var(--radius-md, 8px);
  border: 1.5px solid color-mix(in srgb, var(--color-primary) 50%, transparent);
  background: color-mix(in srgb, var(--color-primary) 8%, transparent);
  color: var(--color-primary);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &::before {
    content: '📋';
    font-size: 0.8rem;
  }

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 16%, transparent);
    border-color: var(--color-primary);
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

/* ── 工具列卡片 ── */
.toolbar-card {
  background: var(--color-surface);
  border-radius: 14px;
  padding: 1rem 1.25rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.token-section {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.token-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.token-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.token-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.22rem 0.65rem;
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &.auto {
    border: 1.5px solid color-mix(in srgb, var(--color-primary) 40%, transparent);
    color: var(--color-primary-dark, var(--color-primary));
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);

    &:hover {
      background: color-mix(in srgb, var(--color-primary) 18%, transparent);
    }
  }
}

.global-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
}

.global-field {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
}

.global-field-name {
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent);
  border-radius: 6px;
  padding: 0.15rem 0.45rem;
  font-size: 0.75rem;
}

.global-field-input {
  width: 150px;
  padding: 0.25rem 0.55rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.8rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

/* ── 主體雙欄 ── */
.main-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  align-items: start;
}

.panel {
  background: var(--color-surface);
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.panel-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.loading-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-text-muted);
}

.saved-badge {
  font-size: 0.68rem;
  font-weight: 600;
  background: color-mix(in srgb, var(--color-secondary) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-secondary) 35%, transparent);
  color: var(--color-secondary-dark, var(--color-secondary));
  border-radius: 99px;
  padding: 0.1rem 0.45rem;
}

.reset-btn {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

/* ── 左側模板編輯 ── */
.editor-panel {
  padding: 0;
}

.template-area {
  flex: 1;
  width: 100%;
  min-height: 340px;
  padding: 0.85rem 1.1rem;
  border: none;
  border-radius: 0;
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  line-height: 1.65;
  color: var(--color-text);
  background: var(--color-surface);
  transition: background 0.15s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    background: color-mix(in srgb, var(--color-primary) 2%, var(--color-surface));
  }
}

.template-hint {
  padding: 0.55rem 1.1rem;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  border-top: 1px solid var(--color-border);
}

/* ── 右側付款訊息 ── */
.messages-panel {
  max-height: 75vh;
}

.customer-select-wrap {
  flex: 1;
  min-width: 0;
}

.copy-btn {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  &.copied {
    border-color: #16a34a;
    color: #16a34a;
    background: color-mix(in srgb, #16a34a 8%, transparent);
  }
}

.messages-body {
  flex: 1;
  overflow-y: auto;
}

.list-loading,
.list-empty {
  text-align: center;
  padding: 2.5rem 1rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.message-preview {
  margin: 0;
  padding: 1rem 1.1rem;
  font-size: 0.875rem;
  font-family: inherit;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--color-text);
  background: var(--color-surface);
}

@media (max-width: 768px) {
  .main-panel {
    grid-template-columns: 1fr;
  }

  .messages-panel {
    max-height: none;
  }
}

/* ── 金額警示 ── */
.amount-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.45rem;
  border-radius: 99px;
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.4;
  margin-left: 0.35rem;
  white-space: nowrap;
}

.zero-badge {
  background: color-mix(in srgb, var(--color-danger, #e53e3e) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-danger, #e53e3e) 40%, transparent);
  color: var(--color-danger, #e53e3e);
}

.over8k-badge {
  background: color-mix(in srgb, #d97706 12%, transparent);
  border: 1px solid color-mix(in srgb, #d97706 40%, transparent);
  color: #b45309;
}

.over10k-badge {
  background: color-mix(in srgb, #dc2626 12%, transparent);
  border: 1px solid color-mix(in srgb, #dc2626 40%, transparent);
  color: #dc2626;
}

/* ── 名單備註標籤 ── */
.remark-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.5rem;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}

.remark-zero {
  background: color-mix(in srgb, #e53e3e 12%, transparent);
  border: 1px solid color-mix(in srgb, #e53e3e 40%, transparent);
  color: #e53e3e;
}

.remark-over8k {
  background: color-mix(in srgb, #d97706 12%, transparent);
  border: 1px solid color-mix(in srgb, #d97706 40%, transparent);
  color: #b45309;
}

.remark-over10k {
  background: color-mix(in srgb, #dc2626 12%, transparent);
  border: 1px solid color-mix(in srgb, #dc2626 40%, transparent);
  color: #dc2626;
}

/* ── 名單彈窗 ── */
.settlement-modal-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}

.settlement-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  font-size: 0.875rem;
}

.settlement-list-header,
.settlement-list-row,
.settlement-list-footer {
  display: grid;
  grid-template-columns: 1fr 100px 100px;
  gap: 0.5rem;
  padding: 0.5rem 0.25rem;
  align-items: center;
}

.settlement-list-header {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  text-transform: uppercase;
  border-bottom: 1.5px solid var(--color-border);
  padding-bottom: 0.4rem;

  span:not(:first-child) {
    text-align: right;
  }
}

.settlement-list-row {
  border-bottom: 1px solid color-mix(in srgb, var(--color-border) 50%, transparent);

  span:not(:first-child) {
    text-align: right;
    color: var(--color-text-secondary);
  }

  &:last-of-type {
    border-bottom: none;
  }
}

.settlement-customer-name {
  font-weight: 500;
  color: var(--color-text);
}

.settlement-total {
  font-weight: 700;
  color: var(--color-primary);
}

.settlement-list-footer {
  border-top: 1.5px solid var(--color-border);
  margin-top: 0.25rem;
  font-weight: 700;
  color: var(--color-text);

  span:not(:first-child) {
    text-align: right;
  }
}
</style>
