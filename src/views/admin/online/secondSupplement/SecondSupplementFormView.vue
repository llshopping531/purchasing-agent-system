<script setup lang="ts">
/**
 * 通販國際運費計算 - 新增／編輯頁
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TextInput from '@/components/inputs/TextInput.vue'
import { useSecondSupplementStore } from '@/stores/secondSupplement'
import { useMenuStore } from '@/stores/menu'
import type { OnlineEventsResBase } from '@/services/api/online/online-events/online-events-api-interfaces'
import { PATH } from '@/constants/route.constant'

const router = useRouter()
const route = useRoute()
const store = useSecondSupplementStore()
const menuStore = useMenuStore()

const isEditMode = computed(() => route.name === 'OnlineSecondSupplementEdit')
const editId = computed(() => Number(route.params.id))

// ── 欄位 ─────────────────────────────────────────────────────
const name = ref('')
const internationalShippingTotal = ref('')
const totalWeightG = ref('')
const pricePerKg = ref('150')

function calcShipping() {
  const kg = Number(totalWeightG.value) / 1000
  const price = Number(pricePerKg.value)
  if (kg > 0 && price > 0) {
    internationalShippingTotal.value = String(Math.ceil(kg * price))
  }
}

// ── 活動列表 ─────────────────────────────────────────────────
const allEvents = ref<OnlineEventsResBase[]>([])
const searchKeyword = ref('')
const selectedEventIds = ref<number[]>([])

const filteredEvents = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return allEvents.value
  return allEvents.value.filter((e) => e.name.toLowerCase().includes(kw))
})

function isSelected(id: number) {
  return selectedEventIds.value.includes(id)
}

function toggleEvent(id: number) {
  const idx = selectedEventIds.value.indexOf(id)
  if (idx !== -1) {
    selectedEventIds.value.splice(idx, 1)
  } else {
    selectedEventIds.value.push(id)
  }
}

const selectedEventNames = computed(() =>
  selectedEventIds.value
    .map((id) => allEvents.value.find((e) => e.id === id)?.name ?? '')
    .filter(Boolean),
)

// ── 驗證 ─────────────────────────────────────────────────────
const canSubmit = computed(() =>
  name.value.trim() !== '' &&
  selectedEventIds.value.length > 0 &&
  internationalShippingTotal.value !== '' &&
  totalWeightG.value !== '' &&
  pricePerKg.value !== '',
)

// ── 掛載 ─────────────────────────────────────────────────────
onMounted(async () => {
  const events = await menuStore.fetchOnlineEventsAll()
  allEvents.value = events

  if (isEditMode.value) {
    const bill = store.getById(editId.value)
    if (!bill) {
      router.replace(PATH.onlineSecondSupplement)
      return
    }
    name.value = bill.name
    internationalShippingTotal.value = String(bill.internationalShippingTotal)
    totalWeightG.value = String(bill.totalWeightG)
    pricePerKg.value = String(bill.pricePerKg)
    selectedEventIds.value = [...bill.eventIds]
  }
})

// ── 存檔 ─────────────────────────────────────────────────────
function submit() {
  if (!canSubmit.value) return

  const data = {
    name: name.value.trim(),
    eventIds: [...selectedEventIds.value],
    eventNames: selectedEventNames.value,
    internationalShippingTotal: Number(internationalShippingTotal.value) || 0,
    totalWeightG: Number(totalWeightG.value) || 0,
    pricePerKg: Number(pricePerKg.value) || 0,
    orders: isEditMode.value ? (store.getById(editId.value)?.orders ?? []) : [],
    createdAt: isEditMode.value
      ? (store.getById(editId.value)?.createdAt ?? new Date().toLocaleString('zh-TW'))
      : new Date().toLocaleString('zh-TW'),
  }

  if (isEditMode.value) {
    store.update({ id: editId.value, ...data })
  } else {
    store.create(data)
  }

  router.push(PATH.onlineSecondSupplement)
}

function cancel() {
  router.push(PATH.onlineSecondSupplement)
}
</script>

<template>
  <div class="form-page">

    <!-- 頁首 -->
    <div class="form-header">
      <button class="back-btn" @click="cancel">← 返回</button>
      <h3>{{ isEditMode ? '編輯集運出貨單' : '新增集運出貨單' }}</h3>
    </div>

    <!-- 基本資訊 -->
    <div class="section-card">
      <text-input label="名稱" v-model:value="name" placeholder="輸入名稱" required />

      <div class="form-grid">
        <text-input
          label="總重量（g）"
          v-model:value="totalWeightG"
          placeholder="0"
          required
          @blur="calcShipping"
        />
        <text-input
          label="每公斤金額（/kg）"
          v-model:value="pricePerKg"
          placeholder="150"
          required
          @blur="calcShipping"
        />
        <text-input
          label="國境運費總額（台幣）"
          v-model:value="internationalShippingTotal"
          placeholder="自動計算"
          required
        />
      </div>

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
            @change="toggleEvent(event.id)"
          />
          <span class="event-name">{{ event.name }}</span>
          <span class="event-meta">{{ event.startDate }}</span>
          <span class="event-progress">{{ event.progressName }}</span>
        </label>
        <div v-if="filteredEvents.length === 0" class="event-empty">無符合的活動</div>
      </div>
      <div v-else class="event-empty">載入中…</div>
    </div>

    <!-- 底部操作 -->
    <div class="form-footer">
      <button class="btn-cancel" @click="cancel">取消</button>
      <button class="btn-submit" @click="submit" :disabled="!canSubmit">
        {{ isEditMode ? '儲存' : '建立二補單' }}
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

.form-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  > * {
    flex: 1;
    min-width: 160px;
  }
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

.event-empty {
  padding: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
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
