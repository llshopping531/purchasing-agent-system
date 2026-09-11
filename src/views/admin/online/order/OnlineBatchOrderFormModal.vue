<script setup lang="ts">
/**
 * 通販訂單批次新增彈窗
 * 點擊「新增」立即送出 API（非同步，不需等待）
 * 支援新增不存在的顧客與商品
 */
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import MaskComponent from '@/components/MaskComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CustomerSelectComponent from '@/components/inputs/selects/CustomerSelectComponent.vue'
import NewCustomerForm from '@/components/forms/NewCustomerForm.vue'
import PriceRateInputComponent from '@/components/inputs/PriceRateInputComponent.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { onlineProductsApi } from '@/services/api/online/online-products/online-products-api'
import { onlineOrdersApi } from '@/services/api/online/online-orders/online-orders-api'
import { customersApi } from '@/services/api/offline/customers/customers-api'
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
  // 顧客
  isNewCustomer: false,
  customerOption: undefined as SelectOption<CustomersResBase | undefined> | undefined,
  newCustomerName: '',
  newCustomerSource: '',
  hasMessagedOfficial: false,
  isDiscount: false,
  isBoss: false,
  newCustomerNote: '',
  // 商品
  isNewProduct: false,
  productOption: undefined as SelectOption<OnlineProductsResBase | null> | undefined,
  newProductName: '',
  newProductPriceJpy: null as number | null,
  newProductExchangeRate: null as number | null,
  newProductPriceTwd: null as number | null,
  // 訂單
  quantity: 1 as number | null,
  officialOrderId: null as number | null,
  note: '',
})

const formErrors = ref({
  customer: '',
  newCustomerName: '',
  newCustomerSource: '',
  product: '',
  newProductName: '',
  quantity: '',
})

watch(() => form.customerOption, () => { formErrors.value.customer = '' })
watch(() => form.productOption, () => { formErrors.value.product = '' })
watch(() => form.quantity, () => { formErrors.value.quantity = '' })

function snapshotForm() {
  return { ...form }
}

function clickAddCustomer() {
  form.isNewCustomer = true
  form.customerOption = undefined
}

function clickAddProduct() {
  form.isNewProduct = true
  form.productOption = undefined
}

function clickBackToProduct() {
  form.isNewProduct = false
  loadProductOptions()
}

// ── 立即新增並送出 ────────────────────────────────────────────
async function addAndSubmit() {
  formErrors.value = { customer: '', newCustomerName: '', newCustomerSource: '', product: '', newProductName: '', quantity: '' }
  let valid = true

  if (form.isNewCustomer) {
    if (!form.newCustomerName.trim()) { formErrors.value.newCustomerName = '顧客名稱為必填'; valid = false }
    if (!form.newCustomerSource.trim()) { formErrors.value.newCustomerSource = '來源為必填'; valid = false }
  } else if (!form.customerOption?.value) {
    formErrors.value.customer = '請選擇顧客'; valid = false
  }

  if (form.isNewProduct) {
    if (!form.newProductName.trim()) { formErrors.value.newProductName = '商品名稱為必填'; valid = false }
  } else if (!form.productOption?.value) {
    formErrors.value.product = '請選擇商品'; valid = false
  }

  if (form.quantity === null || form.quantity === undefined) {
    formErrors.value.quantity = '數量為必填'; valid = false
  } else if (form.quantity <= 0) {
    formErrors.value.quantity = '數量不得為 0'; valid = false
  }

  if (!valid) return

  const snap = snapshotForm()
  const customerLabel = snap.isNewCustomer ? snap.newCustomerName : snap.customerOption!.name
  const productLabel = snap.isNewProduct ? snap.newProductName : snap.productOption!.name

  const item: QueueItem = {
    id: `${Date.now()}-${Math.random()}`,
    customerName: customerLabel,
    productName: productLabel,
    quantity: snap.quantity!,
    status: 'submitting',
  }
  queue.value.unshift(item)

  const submit = async () => {
    let customerId = snap.customerOption?.value?.id ?? 0
    if (snap.isNewCustomer) {
      const newCustomer = await customersApi.postCustomers({
        name: snap.newCustomerName,
        source: snap.newCustomerSource,
        hasMessagedOfficial: snap.hasMessagedOfficial,
        isDiscount: snap.isDiscount,
        isBoss: snap.isBoss,
        note: snap.newCustomerNote,
      })
      customerId = newCustomer.id
    }

    let productId = snap.productOption?.value?.id ?? 0
    if (snap.isNewProduct) {
      const newProduct = await onlineProductsApi.postOnlineProducts({
        eventId: Number(props.eventId),
        name: snap.newProductName,
        priceJpy: snap.newProductPriceJpy ?? undefined,
        exchangeRate: snap.newProductExchangeRate ?? undefined,
        priceTwd: snap.newProductPriceTwd ?? undefined,
      })
      productId = newProduct.id
    }

    await onlineOrdersApi.postOnlineOrders({
      eventId: Number(props.eventId),
      customerId,
      productId,
      officialOrderId: snap.officialOrderId ?? undefined,
      quantity: snap.quantity!,
      note: snap.note || undefined,
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
const isWaitingToClose = ref(false)
const isShowCloseConfirm = ref(false)
const isFormDirty = computed(() => !!form.customerOption || !!form.productOption || form.isNewCustomer || form.isNewProduct)

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
          <!-- 顧客 -->
          <div class="field">
            <template v-if="!form.isNewCustomer">
              <customer-select-component
                required
                :defaultValue="form.customerOption"
                @selectOption="form.customerOption = $event"
              />
              <span v-if="formErrors.customer" class="field-error">{{ formErrors.customer }}</span>
              <div class="add-link" @click="clickAddCustomer">新增顧客</div>
            </template>
            <template v-else>
              <div class="new-form">
                <new-customer-form
                  v-model:name="form.newCustomerName"
                  v-model:source="form.newCustomerSource"
                  v-model:hasMessagedOfficial="form.hasMessagedOfficial"
                  v-model:isDiscount="form.isDiscount"
                  v-model:isBoss="form.isBoss"
                  v-model:note="form.newCustomerNote"
                  :errors="{
                    name: formErrors.newCustomerName || undefined,
                    source: formErrors.newCustomerSource || undefined,
                  }"
                />
                <div class="add-link" @click="form.isNewCustomer = false">返回選擇顧客</div>
              </div>
            </template>
          </div>

          <!-- 商品 -->
          <div class="field">
            <template v-if="!form.isNewProduct">
              <select-component
                label="商品"
                :optionList="productOptions"
                :defaultValue="form.productOption ?? productOptions[0]"
                :required="true"
                @selectOption="form.productOption = $event"
              />
              <span v-if="formErrors.product" class="field-error">{{ formErrors.product }}</span>
              <div class="add-link" @click="clickAddProduct">找不到商品？新增商品</div>
            </template>
            <template v-else>
              <div class="new-form">
                <text-input
                  label="商品名稱"
                  v-model:value="form.newProductName"
                  required
                  :error-message="formErrors.newProductName"
                />
                <price-rate-input-component
                  v-model:priceJpy="form.newProductPriceJpy"
                  v-model:exchangeRate="form.newProductExchangeRate"
                  v-model:priceTwd="form.newProductPriceTwd"
                />
                <div class="add-link" @click="clickBackToProduct">返回選擇商品</div>
              </div>
            </template>
          </div>

          <!-- 訂單欄位 -->
          <div class="field">
            <text-input label="數量" v-model:value="form.quantity" required :error-message="formErrors.quantity" />
          </div>
          <div class="field">
            <text-input label="官方訂單 ID" v-model:value="form.officialOrderId" />
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

    <!-- 關閉確認 -->
    <modal-component
      v-if="isShowCloseConfirm"
      name="提醒"
      width="360px"
      :isShowCancelBtn="true"
      @confirm="confirmClose"
      @cancel="isShowCloseConfirm = false"
    >
      <template #content>
        <div class="remind">
          <p>您確定要關閉視窗嗎？</p>
          <span>請確認是否尚有未送出的訂單</span>
        </div>
      </template>
    </modal-component>

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
  width: 720px;
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

.new-form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: color-mix(in srgb, var(--color-primary) 6%, var(--color-surface));
  padding: 0.65rem;
  border-radius: 8px;
}

.add-link {
  font-size: 0.82rem;
  color: var(--color-primary);
  cursor: pointer;
  margin-top: 0.25rem;

  &:hover { text-decoration: underline; }
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

.waiting-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-primary);
}

.remind {
  text-align: center;
  padding: 1.5rem 0.5rem 0.5rem;

  p { font-size: 1rem; color: #333; margin-bottom: 0.75rem; line-height: 1.7; }
  span { font-size: 0.8rem; color: var(--color-danger); font-weight: 500; }
}

.field-error {
  display: block;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
  margin-top: 0.25rem;
  font-weight: 500;
}
</style>
