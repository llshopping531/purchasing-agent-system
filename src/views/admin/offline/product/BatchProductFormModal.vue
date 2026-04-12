<script setup lang="ts">
/**
 * 批次新增商品彈窗
 * 點擊 新增 立即送出 API（非同步，不需等待）
 * 關閉時若仍有送出中的項目，顯示等待畫面直到全部完成
 */
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import MaskComponent from '@/components/MaskComponent.vue'
import NewProductForm from '@/components/forms/NewProductForm.vue'
import { productsApi } from '@/services/api/products/products-api'
import { useModalLayer } from '@/composables/useModalLayer'

const props = defineProps<{
  eventId: string
  shopId: string
  defaultExchangeRate?: number
}>()

const emit = defineEmits<{
  (e: 'confirmed'): void
  (e: 'close'): void
}>()

// ── Modal 層級 ────────────────────────────────────────────────
const { acquire, release } = useModalLayer()
const maskZ = ref(200)
const modalZ = ref(201)
onMounted(() => {
  const z = acquire()
  maskZ.value = z.maskZ
  modalZ.value = z.modalZ
})
onUnmounted(() => release())

// ── 記錄清單 ──────────────────────────────────────────────────
type QueueStatus = 'submitting' | 'success' | 'error'

interface QueueItem {
  id: string
  name: string
  status: QueueStatus
  errorMsg?: string
}

const queue = ref<QueueItem[]>([])

const hasSubmitting = computed(() => queue.value.some((i) => i.status === 'submitting'))
const hasSuccess = computed(() => queue.value.some((i) => i.status === 'success'))

// ── 表單狀態 ──────────────────────────────────────────────────
const form = reactive({
  name: '',
  priceJpy: null as number | null,
  exchangeRate: props.defaultExchangeRate ?? null as number | null,
  priceTwd: null as number | null,
  image: '',
  isBlindBox: false,
})

function snapshotForm() {
  return { ...form }
}

const formErrors = ref({ name: '' })

// ── 立即新增並送出 ────────────────────────────────────────────
async function addAndSubmit() {
  formErrors.value.name = ''

  if (!form.name.trim()) {
    formErrors.value.name = '商品名稱為必填'
    return
  }

  const snap = snapshotForm()

  const item: QueueItem = {
    id: `${Date.now()}-${Math.random()}`,
    name: snap.name,
    status: 'submitting',
  }
  queue.value.push(item)

  const submit = async () => {
    await productsApi.postProducts({
      eventId: Number(props.eventId),
      channelId: Number(props.shopId),
      name: snap.name,
      priceJpy: snap.priceJpy ?? undefined,
      exchangeRate: snap.exchangeRate ?? undefined,
      priceTwd: snap.priceTwd ?? undefined,
      image: snap.image,
      isBlindBox: snap.isBlindBox,
    })
  }

  submit()
    .then(() => {
      const target = queue.value.find((i) => i.id === item.id)
      if (target) target.status = 'success'
      emit('confirmed')
    })
    .catch((err: Error) => {
      const target = queue.value.find((i) => i.id === item.id)
      if (target) { target.status = 'error'; target.errorMsg = err.message }
    })
}

// ── 關閉處理 ──────────────────────────────────────────────────
/** 使用者點關閉但仍有送出中時，顯示等待畫面 */
const isWaitingToClose = ref(false)
/** 顯示關閉確認提示 */
const isShowCloseConfirm = ref(false)

/** 表單是否有非預設資料 */
const isFormDirty = computed(() => !!form.name.trim())

function tryClose() {
  if (hasSubmitting.value) {
    isWaitingToClose.value = true
    return
  }
  if (isFormDirty.value) {
    isShowCloseConfirm.value = true
    return
  }
  emit('close')
}

function confirmClose() {
  isShowCloseConfirm.value = false
  emit('close')
}

/** 等待中時，所有送出完成後自動關閉 */
watch(hasSubmitting, (submitting) => {
  if (!submitting && isWaitingToClose.value) {
    emit('close')
  }
})

const statusLabel: Record<QueueStatus, string> = {
  submitting: '送出中',
  success: '成功',
  error: '失敗',
}
</script>

<template>
  <mask-component :zIndex="maskZ" @click="tryClose" />
  <div class="batch-modal" :style="{ zIndex: modalZ }">
    <div class="modal-title">新增商品</div>

    <div class="modal-body">
      <!-- 表單區 -->
      <div class="form-area product">
        <new-product-form
          v-model:name="form.name"
          v-model:priceJpy="form.priceJpy"
          v-model:exchangeRate="form.exchangeRate"
          v-model:priceTwd="form.priceTwd"
          v-model:image="form.image"
          v-model:isBlindBox="form.isBlindBox"
          :errors="{ name: formErrors.name || undefined }"
        />
        <div class="add-btn-row">
          <div class="btn add-btn" @click="addAndSubmit">新增</div>
        </div>
      </div>

      <!-- 記錄清單 -->
      <div class="queue-area" v-if="queue.length > 0">
        <div class="queue-header">新增記錄（{{ queue.length }} 筆）</div>
        <div class="queue-list">
          <div v-for="item in queue" :key="item.id" class="queue-item" :class="item.status">
            <div class="queue-item-info">
              <span class="badge" :class="item.status">{{ statusLabel[item.status] }}</span>
              <span class="name">{{ item.name }}</span>
            </div>
            <span v-if="item.errorMsg" class="error-msg">{{ item.errorMsg }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="btn-box">
      <div class="btn btn-outline" @click="tryClose">
        {{ hasSuccess ? '完成' : '關閉' }}
      </div>
    </div>

    <!-- 關閉確認提示 -->
    <div v-if="isShowCloseConfirm" class="waiting-overlay">
      <div class="close-confirm">
        <p>您確定要關閉視窗嗎？</p>
        <span>請確認是否尚有未送出的商品</span>
        <div class="close-confirm-btns">
          <div class="btn" @click="confirmClose">確定關閉</div>
          <div class="btn btn-outline" @click="isShowCloseConfirm = false">取消</div>
        </div>
      </div>
    </div>

    <!-- 等待關閉遮罩 -->
    <div v-if="isWaitingToClose" class="waiting-overlay">
      <div class="waiting-text">新增完成後將自動關閉…</div>
    </div>
  </div>
</template>

<style scoped>
.batch-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  width: 600px;
  max-width: 92vw;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-title {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: #fff;
  padding: 0.875rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 表單區 */
.form-area {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.add-btn-row {
  display: flex;
  justify-content: flex-end;

  .add-btn {
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

/* 記錄清單 */
.queue-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.queue-header {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-size: 0.875rem;
  gap: 0.5rem;
  flex-wrap: wrap;

  &.success {
    background: #f0faf0;
    border-color: #b2dfb2;
  }
  &.error {
    background: #fff5f5;
    border-color: #fca5a5;
  }
  &.submitting {
    opacity: 0.6;
  }
}

.queue-item-info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: var(--color-border);
  color: var(--color-text-secondary);

  &.submitting {
    background: #dbeafe;
    color: #1d4ed8;
  }
  &.success {
    background: #dcfce7;
    color: #15803d;
  }
  &.error {
    background: #fee2e2;
    color: #b91c1c;
  }
}

.error-msg {
  font-size: 0.78rem;
  color: var(--color-danger);
}

/* 底部按鈕 */
.btn-box {
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  background: #faf9ff;
}

/* 等待關閉遮罩 */
.close-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;

  p {
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  span {
    font-size: 0.82rem;
    color: var(--color-danger);
  }
}

.close-confirm-btns {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.waiting-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}

.waiting-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-primary);
}
</style>
