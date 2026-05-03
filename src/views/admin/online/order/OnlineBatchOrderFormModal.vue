<script setup lang="ts">
/**
 * 通販訂單批次新增彈窗
 * 點擊「新增」立即送出 API（非同步，不需等待）
 * 關閉時若仍有送出中的項目，顯示等待畫面直到全部完成
 */
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import MaskComponent from '@/components/MaskComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import CustomerSelectComponent from '@/components/inputs/selects/CustomerSelectComponent.vue'
import { onlineProductsApi } from '@/services/api/online/online-products/online-products-api'
import { onlineOrdersApi } from '@/services/api/online/online-orders/online-orders-api'
import type { OnlineProductsResBase } from '@/services/api/online/online-products/online-products-api-interfaces'
import type { CustomersResBase } from '@/services/api/offline/customers/customers-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { useModalLayer } from '@/composables/useModalLayer'

const props = defineProps<{
  eventId: string
}>()

const emit = defineEmits<{
  (e: 'confirmed'): void
  (e: 'close'): void
}>()

// ── Modal 層級 ────────────────────────────────────────────────
const { acquire, release } = useModalLayer()
const maskZ = ref(200)
const modalZ = ref(201)
onMounted(async () => {
  const z = acquire()
  maskZ.value = z.maskZ
  modalZ.value = z.modalZ
  await loadProductOptions()
})
onUnmounted(() => release())

// ── 商品選項 ──────────────────────────────────────────────────
const productOptions = ref<SelectOption<OnlineProductsResBase | null>[]>([
  { name: '請選擇商品', value: null },
])

async function loadProductOptions() {
  if (!props.eventId) return
  const res = await onlineProductsApi.getOnlineProducts({ eventId: Number(props.eventId), size: 1000 })
  productOptions.value = [
    { name: '請選擇商品', value: null },
    ...res.content.map((p) => ({ name: p.name, value: p })),
  ]
}

// ── 記錄清單 ──────────────────────────────────────────────────
type QueueStatus = 'submitting' | 'success' | 'error'

interface QueueItem {
  id: string
  customerName: string
  productName: string
  quantity: number
  status: QueueStatus
  errorMsg?: string
}

const queue = ref<QueueItem[]>([])
const hasSubmitting = computed(() => queue.value.some((i) => i.status === 'submitting'))
const hasSuccess = computed(() => queue.value.some((i) => i.status === 'success'))

// ── 表單狀態 ──────────────────────────────────────────────────
const form = reactive({
  customerOption: undefined as SelectOption<CustomersResBase | undefined> | undefined,
  productOption: undefined as SelectOption<OnlineProductsResBase | null> | undefined,
  quantity: null as number | null,
  officialOrderId: null as number | null,
  domesticShipping: null as number | null,
  internationalShipping: null as number | null,
  note: '',
})

const formErrors = ref({ customer: '', product: '', quantity: '' })
watch(() => form.customerOption, () => { formErrors.value.customer = '' })
watch(() => form.productOption, () => { formErrors.value.product = '' })
watch(() => form.quantity, () => { formErrors.value.quantity = '' })

function snapshotForm() {
  return { ...form }
}

// ── 立即新增並送出 ────────────────────────────────────────────
async function addAndSubmit() {
  formErrors.value = { customer: '', product: '', quantity: '' }
  let valid = true

  if (!form.customerOption?.value) { formErrors.value.customer = '請選擇顧客'; valid = false }
  if (!form.productOption?.value) { formErrors.value.product = '請選擇商品'; valid = false }
  if (form.quantity === null || form.quantity === undefined) {
    formErrors.value.quantity = '數量為必填'; valid = false
  } else if (form.quantity <= 0) {
    formErrors.value.quantity = '數量不得為 0'; valid = false
  }
  if (!valid) return

  const snap = snapshotForm()

  const item: QueueItem = {
    id: `${Date.now()}-${Math.random()}`,
    customerName: snap.customerOption!.name,
    productName: snap.productOption!.name,
    quantity: snap.quantity!,
    status: 'submitting',
  }
  queue.value.unshift(item)

  onlineOrdersApi
    .postOnlineOrders({
      eventId: Number(props.eventId),
      customerId: snap.customerOption!.value!.id,
      productId: snap.productOption!.value!.id,
      officialOrderId: snap.officialOrderId ?? undefined,
      quantity: snap.quantity!,
      domesticShipping: snap.domesticShipping ?? undefined,
      internationalShipping: snap.internationalShipping ?? undefined,
      note: snap.note || undefined,
    })
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
const isWaitingToClose = ref(false)
const isShowCloseConfirm = ref(false)
const isFormDirty = computed(() => !!form.customerOption || !!form.productOption)

function tryClose() {
  if (hasSubmitting.value) { isWaitingToClose.value = true; return }
  if (isFormDirty.value) { isShowCloseConfirm.value = true; return }
  emit('close')
}

function confirmClose() {
  isShowCloseConfirm.value = false
  emit('close')
}

watch(hasSubmitting, (submitting) => {
  if (!submitting && isWaitingToClose.value) emit('close')
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
    <div class="modal-title">批次新增訂單</div>

    <div class="modal-body">
      <!-- 表單區 -->
      <div class="form-area">
        <div class="form-row">
          <div class="field">
            <customer-select-component
              required
              :defaultValue="form.customerOption"
              @selectOption="form.customerOption = $event"
            />
            <span v-if="formErrors.customer" class="field-error">{{ formErrors.customer }}</span>
          </div>
          <div class="field">
            <select-component
              label="商品"
              :optionList="productOptions"
              :defaultValue="form.productOption ?? productOptions[0]"
              :required="true"
              @selectOption="form.productOption = $event"
            />
            <span v-if="formErrors.product" class="field-error">{{ formErrors.product }}</span>
          </div>
          <div class="field">
            <text-input
              label="數量"
              v-model:value="form.quantity"
              required
              :error-message="formErrors.quantity"
            />
          </div>
          <div class="field">
            <text-input label="官方訂單 ID" v-model:value="form.officialOrderId" />
          </div>
          <div class="field">
            <text-input label="日本境內運費" v-model:value="form.domesticShipping" />
          </div>
          <div class="field">
            <text-input label="國際運費" v-model:value="form.internationalShipping" />
          </div>
          <div class="field">
            <text-input label="備註" v-model:value="form.note" />
          </div>
        </div>
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
              <span class="customer">{{ item.customerName }}</span>
              <span class="sep">／</span>
              <span class="product">{{ item.productName }}</span>
              <span class="qty">×{{ item.quantity }}</span>
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
        <span>請確認是否尚有未送出的訂單</span>
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
  width: 680px;
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

.form-area {
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
  border-radius: var(--radius-md);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  .field {
    width: calc(50% - 0.375rem);

    @media (max-width: 768px) {
      width: 100%;
    }
  }
}

.add-btn-row {
  display: flex;
  justify-content: flex-end;

  .add-btn {
    padding: 0.5rem 1.25rem;
    line-height: 1;
  }
}

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

  &.success { background: #f0faf0; border-color: #b2dfb2; }
  &.error { background: #fff5f5; border-color: #fca5a5; }
  &.submitting { opacity: 0.6; }
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

  &.submitting { background: #dbeafe; color: #1d4ed8; }
  &.success { background: #dcfce7; color: #15803d; }
  &.error { background: #fee2e2; color: #b91c1c; }
}

.sep { color: var(--color-text-muted); }
.qty { font-weight: 600; }

.error-msg {
  font-size: 0.78rem;
  color: var(--color-danger);
}

.btn-box {
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
  background: #faf9ff;
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

.close-confirm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;

  p { font-size: 1rem; font-weight: 600; color: #333; }
  span { font-size: 0.82rem; color: var(--color-danger); }
}

.close-confirm-btns {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.waiting-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-primary);
}

.field-error {
  display: block;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
  margin-top: 0.25rem;
  font-weight: 500;
}
</style>
