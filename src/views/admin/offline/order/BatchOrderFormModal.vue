<script setup lang="ts">
/**
 * 批次新增訂單彈窗
 * 點擊 ＋ 立即送出 API（非同步，不需等待）
 * 關閉時若仍有送出中的項目，顯示等待畫面直到全部完成
 */
import { ref, watch, computed } from 'vue'
import MaskComponent from '@/components/MaskComponent.vue'
import CustomerSelectComponent from '@/components/inputs/selects/CustomerSelectComponent.vue'
import ProductSelectComponent from '@/components/inputs/selects/ProductSelectComponent.vue'
import NewCustomerForm from '@/components/forms/NewCustomerForm.vue'
import NewProductForm from '@/components/forms/NewProductForm.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import type { Option } from '@/interfaces/common'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'
import { orderApi } from '@/services/api/order/order-api'
import { customersApi } from '@/services/api/customers/customers-api'
import { productsApi } from '@/services/api/products/products-api'
import { useModalLayer } from '@/composables/useModalLayer'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  eventId: string
  shopId: string
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
  customerOption: Option
  productOption: Option
  quantity: number
  isFixedRate: boolean
  nonCutTarget: boolean
  status: QueueStatus
  errorMsg?: string
}

const queue = ref<QueueItem[]>([])

const hasSubmitting = computed(() => queue.value.some((i) => i.status === 'submitting'))
const hasSuccess = computed(() => queue.value.some((i) => i.status === 'success'))

// ── 顧客欄位 ──────────────────────────────────────────────────
const isNewCustomer = ref(false)
const formCustomerOption = ref<Option | undefined>(undefined)
const formNewCustomerName = ref('')
const formNewCustomerSource = ref('')
const formHasMessagedOfficial = ref(false)
const formIsDiscount = ref(false)
const formIsBoss = ref(false)
const formNewCustomerNote = ref('')

// ── 商品欄位 ──────────────────────────────────────────────────
const isNewProduct = ref(false)
const formProductOption = ref<Option | undefined>(undefined)
const formProduct = ref<ProductsResBase | undefined>(undefined)
const formNewProductName = ref('')
const formNewProductPriceJpy = ref<number | null>(null)
const formNewProductExchangeRate = ref<number | null>(null)
const formNewProductPriceTwd = ref<number | null>(null)
const formNewProductImage = ref('')

// ── 訂單欄位 ──────────────────────────────────────────────────
const formQuantity = ref<number | null>(1)
const formIsFixedRate = ref(false)
const formNonCutTarget = ref(false)

const formErrors = ref({
  customer: '',
  newCustomerName: '',
  newCustomerSource: '',
  product: '',
  newProductName: '',
  quantity: '',
})

function onSelectProduct(product: ProductsResBase) {
  formProduct.value = product
}

function clickAddCustomer() {
  isNewCustomer.value = true
  formCustomerOption.value = undefined
}

function clickAddProduct() {
  isNewProduct.value = true
  formProductOption.value = undefined
  formProduct.value = undefined
}

// ── 立即新增並送出 ────────────────────────────────────────────
async function addAndSubmit() {
  formErrors.value = {
    customer: '',
    newCustomerName: '',
    newCustomerSource: '',
    product: '',
    newProductName: '',
    quantity: '',
  }
  let valid = true

  if (isNewCustomer.value) {
    if (!formNewCustomerName.value.trim()) {
      formErrors.value.newCustomerName = '顧客名稱為必填'
      valid = false
    }
    if (!formNewCustomerSource.value.trim()) {
      formErrors.value.newCustomerSource = '來源為必填'
      valid = false
    }
  } else if (!formCustomerOption.value) {
    formErrors.value.customer = '請選擇顧客'
    valid = false
  }

  if (isNewProduct.value) {
    if (!formNewProductName.value.trim()) {
      formErrors.value.newProductName = '商品名稱為必填'
      valid = false
    }
  } else if (!formProductOption.value || !formProduct.value) {
    formErrors.value.product = '請選擇商品'
    valid = false
  }

  if (formQuantity.value === null || formQuantity.value === undefined) {
    formErrors.value.quantity = '數量為必填'
    valid = false
  } else if (formQuantity.value <= 0) {
    formErrors.value.quantity = '數量不得為 0'
    valid = false
  }

  if (!valid) return

  // 顯示名稱（用於記錄清單）
  const customerLabel = isNewCustomer.value
    ? formNewCustomerName.value
    : formCustomerOption.value!.name
  const productLabel = isNewProduct.value ? formNewProductName.value : formProductOption.value!.name

  const item: QueueItem = {
    id: `${Date.now()}-${Math.random()}`,
    customerOption: { value: '', name: customerLabel },
    productOption: { value: '', name: productLabel },
    quantity: formQuantity.value!,
    isFixedRate: formIsFixedRate.value,
    nonCutTarget: formNonCutTarget.value,
    status: 'submitting',
  }
  queue.value.push(item)

  // 建立顧客 / 商品後送出訂單，不等待
  const submit = async () => {
    let customerId = Number(formCustomerOption.value?.value ?? 0)
    if (isNewCustomer.value) {
      const newCustomer = await customersApi.postCustomers({
        name: formNewCustomerName.value,
        source: formNewCustomerSource.value,
        hasMessagedOfficial: formHasMessagedOfficial.value,
        isDiscount: formIsDiscount.value,
        isBoss: formIsBoss.value,
        note: formNewCustomerNote.value,
      })
      customerId = newCustomer.id
    }

    let productId = Number(formProductOption.value?.value ?? 0)
    if (isNewProduct.value) {
      const newProduct = await productsApi.postProducts({
        eventId: Number(props.eventId),
        channelId: Number(props.shopId),
        name: formNewProductName.value,
        priceJpy: formNewProductPriceJpy.value ?? undefined,
        exchangeRate: formNewProductExchangeRate.value ?? undefined,
        priceTwd: formNewProductPriceTwd.value ?? undefined,
        image: formNewProductImage.value,
      })
      productId = newProduct.id
    }

    await orderApi.postOrders({
      eventId: Number(props.eventId),
      channelId: Number(props.shopId),
      customerId,
      productId,
      orderStatus: '已喊單',
      quantity: item.quantity,
      isFixedRate: item.isFixedRate,
      nonCutTarget: item.nonCutTarget,
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
      if (target) {
        target.status = 'error'
        target.errorMsg = err.message
      }
    })
}

// ── 關閉處理 ──────────────────────────────────────────────────
/** 使用者點關閉但仍有送出中時，顯示等待畫面 */
const isWaitingToClose = ref(false)
/** 顯示關閉確認提示 */
const isShowCloseConfirm = ref(false)

/** 表單是否有非預設資料（顧客、商品已選取，或數量不為 1） */
const isFormDirty = computed(
  () => !!formCustomerOption.value || !!formProductOption.value || formQuantity.value !== 1,
)

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

const statusLabel: Record<QueueStatus, string> = {
  submitting: '送出中',
  success: '成功',
  error: '失敗',
}
</script>

<template>
  <mask-component :zIndex="maskZ" @click="tryClose" />
  <div class="batch-modal" :style="{ zIndex: modalZ }">
    <div class="modal-title">新增訂單</div>

    <div class="modal-body">
      <!-- 表單區 -->
      <div class="form-area">
        <div class="form-row">
          <!-- 顧客 -->
          <div class="text-input">
            <template v-if="!isNewCustomer">
              <customer-select-component
                required
                :defaultValue="formCustomerOption"
                @selectOption="formCustomerOption = $event"
              />
              <span v-if="formErrors.customer" class="field-error">{{ formErrors.customer }}</span>
              <div class="addLink" @click="clickAddCustomer">新增顧客</div>
            </template>
            <template v-else>
              <div class="newForm">
                <new-customer-form
                  v-model:name="formNewCustomerName"
                  v-model:source="formNewCustomerSource"
                  v-model:hasMessagedOfficial="formHasMessagedOfficial"
                  v-model:isDiscount="formIsDiscount"
                  v-model:isBoss="formIsBoss"
                  v-model:note="formNewCustomerNote"
                  :errors="{
                    name: formErrors.newCustomerName || undefined,
                    source: formErrors.newCustomerSource || undefined,
                  }"
                />
                <div class="addLink" @click="isNewCustomer = false">返回選擇顧客</div>
              </div>
            </template>
          </div>

          <!-- 商品 -->
          <div class="text-input">
            <template v-if="!isNewProduct">
              <product-select-component
                required
                :eventId="props.eventId"
                :channelId="props.shopId"
                :defaultValue="formProductOption"
                @selectOption="formProductOption = $event"
                @selectProduct="onSelectProduct"
              />
              <span v-if="formErrors.product" class="field-error">{{ formErrors.product }}</span>
              <div class="addLink" @click="clickAddProduct">找不到商品？新增商品</div>
            </template>
            <template v-else>
              <div class="newForm">
                <new-product-form
                  v-model:name="formNewProductName"
                  v-model:priceJpy="formNewProductPriceJpy"
                  v-model:exchangeRate="formNewProductExchangeRate"
                  v-model:priceTwd="formNewProductPriceTwd"
                  v-model:image="formNewProductImage"
                  :errors="{ name: formErrors.newProductName || undefined }"
                />
                <div class="addLink" @click="isNewProduct = false">返回選擇商品</div>
              </div>
            </template>
          </div>
          <div class="text-input">
            <text-input
              label="數量"
              v-model:value="formQuantity"
              required
              :error-message="formErrors.quantity"
            />
          </div>
        </div>
        <div class="form-row">
          <checkbox-input label="固定匯率" v-model="formIsFixedRate" />
          <checkbox-input label="非分潤對象" v-model="formNonCutTarget" />
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
              <span class="customer">{{ item.customerOption.name }}</span>
              <span class="sep">／</span>
              <span class="product">{{ item.productOption.name }}</span>
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

/* 表單區 */
.form-area {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: color-mix(in srgb, var(--color-primary) 4%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-primary) 15%, transparent);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-start;
  .text-input {
    width: calc(100% / 3 - 11px);
  }
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

.sep {
  color: var(--color-text-muted);
}
.qty {
  font-weight: 600;
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

.newForm {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  background: #f3f3f3;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.addLink {
  font-size: 0.82rem;
  color: var(--color-primary);
  cursor: pointer;
  margin-top: 0.35rem;
  &:hover {
    text-decoration: underline;
  }
}

.field-error {
  display: block;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
  margin-top: 0.25rem;
  font-weight: 500;
}
</style>
