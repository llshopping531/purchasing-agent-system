<script setup lang="ts">
/**
 * 訂單新增／修改／刪除彈窗
 * 支援選取現有顧客或即時新增顧客，選取現有商品或即時新增商品
 * 訂單金額（小計 JPY/TWD）及匯率支援自動聯動計算
 * 透過 defineExpose 提供 createOrder / editOrder / deleteOrder 方法供父層呼叫
 */
import { ref, reactive, computed, watch } from 'vue'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import CustomerSelectComponent from '@/components/inputs/selects/CustomerSelectComponent.vue'
import ProductSelectComponent from '@/components/inputs/selects/ProductSelectComponent.vue'
import OrderStatusSelectComponent from '@/components/inputs/selects/OrderStatusSelectComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import NewCustomerForm from '@/components/forms/NewCustomerForm.vue'
import NewProductForm from '@/components/forms/NewProductForm.vue'
import type { Option } from '@/interfaces/common'
import { customersApi } from '@/services/api/customers/customers-api'
import { productsApi } from '@/services/api/products/products-api'
import { orderApi } from '@/services/api/order/order-api'
import type { OrderQueryContent } from '@/services/api/order/order-api-interfaces'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'

const props = defineProps<{
  /** 目前選取的活動 ID（字串形式） */
  eventId: string
  /** 目前選取的通路 ID（字串形式） */
  shopId: string
}>()

const emit = defineEmits<{
  /** 新增、修改或刪除成功後觸發，通知父層重新整理訂單列表 */
  (e: 'confirmed'): void
}>()

/** 彈窗是否顯示 */
const isVisible = ref(false)
/** 操作模式：1 = 新增，2 = 修改，3 = 刪除 */
const modalMode = ref<1 | 2 | 3>(1)
/** 修改／刪除時的目標訂單 ID */
const currentOrderId = ref(0)

// ── 顧客欄位 ──────────────────────────────────────────────────
/** 選取的現有顧客 Option */
const formCustomerOption = ref<Option | undefined>(undefined)
/** 是否切換為新增顧客模式 */
const isNewCustomer = ref(false)
/** 新增顧客：名稱 */
const formNewCustomerName = ref('')
/** 新增顧客：來源 */
const formNewCustomerSource = ref('')
/** 新增顧客：是否已私訊官方 */
const formHasMessagedOfficial = ref(false)
/** 新增顧客：是否享有折扣 */
const formIsDiscount = ref(false)
/** 新增顧客：是否為老闆 */
const formIsBoss = ref(false)
/** 新增顧客：備註 */
const formNewCustomerNote = ref('')

// ── 商品欄位 ──────────────────────────────────────────────────
/** 選取的現有商品 Option */
const formProductOption = ref<Option | undefined>(undefined)
/** 選取的現有商品完整資料（用於計算金額） */
const selectedProduct = ref<ProductsResBase | undefined>(undefined)
/** 修改模式下顯示的商品基本資訊（原始定價、匯率） */
const editProductInfo = ref<
  { name: string; priceJpy: number; priceTwd: number; exchangeRate: number } | undefined
>(undefined)
/** 修改模式下顯示的顧客名稱 */
const editCustomerName = ref('')
/** 是否切換為新增商品模式 */
const isNewProduct = ref(false)
/** 新增商品：名稱 */
const formNewProductName = ref('')
/** 新增商品：日幣定價 */
const formNewProductPriceJpy = ref<number | null>(null)
/** 新增商品：匯率 */
const formNewProductExchangeRate = ref<number | null>(null)
/** 新增商品：台幣定價 */
const formNewProductPriceTwd = ref<number | null>(null)
/** 新增商品：圖片 URL */
const formNewProductImage = ref('')

// ── 訂單欄位 ──────────────────────────────────────────────────
/** 是否允許手動調整匯率（否則由商品定價自動帶入） */
const isAdjustRate = ref(false)
/** 訂購數量 */
const formQuantity = ref<number | null>(null)
/** 匯率 */
const formExchangeRate = ref<number | null>(null)
/** 小計（日幣） */
const formSubtotalJpy = ref<number | null>(null)
/** 小計（台幣） */
const formSubtotalTwd = ref<number | null>(null)
/** 訂單狀態 Option */
const formOrderStatusOption = ref<Option | undefined>(undefined)
/** 備註 */
const formNote = ref('')
/** 是否為非特典對象 */
const formNonBonusTarget = ref(false)
/** 是否固定匯率 */
const formIsFixedRate = ref(false)
/** 是否為非分潤對象 */
const formNonCutTarget = ref(false)
/** 是否已採購確認 */
const formPurchaseConfirm = ref(false)

// ── 驗證錯誤訊息 ──────────────────────────────────────────────
const formErrors = reactive<{
  customer: string
  product: string
  quantity: string
  newCustomerName: string
  newCustomerSource: string
  newProductName: string
  newProductPriceJpy: string
  newProductExchangeRate: string
  newProductPriceTwd: string
}>({
  customer: '',
  product: '',
  quantity: '',
  newCustomerName: '',
  newCustomerSource: '',
  newProductName: '',
  newProductPriceJpy: '',
  newProductExchangeRate: '',
  newProductPriceTwd: '',
})

/** 欄位值變動時清除對應錯誤 */
watch(formCustomerOption, () => { formErrors.customer = '' })
watch(formProductOption, () => { formErrors.product = '' })
watch(formQuantity, () => { formErrors.quantity = '' })
watch(formNewCustomerName, () => { formErrors.newCustomerName = '' })
watch(formNewCustomerSource, () => { formErrors.newCustomerSource = '' })
watch(formNewProductName, () => { formErrors.newProductName = '' })
watch(formNewProductPriceJpy, () => { formErrors.newProductPriceJpy = '' })
watch(formNewProductExchangeRate, () => { formErrors.newProductExchangeRate = '' })
watch(formNewProductPriceTwd, () => { formErrors.newProductPriceTwd = '' })

/**
 * 將日幣金額依匯率換算為台幣，並進位至最近的 5 元
 * @param priceJpy - 日幣金額
 * @param rate - 匯率
 * @returns 進位後的台幣金額
 */
function calcPriceTwd(priceJpy: number, rate: number): number {
  const price = priceJpy * rate
  const floored = Math.floor(price)
  return floored % 5 === 0 ? floored : Math.ceil(price / 5) * 5
}

/** 修改模式下，依當前匯率即時推算的台幣單價（供參考用） */
const editUnitTwd = computed(() => {
  if (!editProductInfo.value?.priceJpy || !formExchangeRate.value) return null
  return calcPriceTwd(editProductInfo.value.priceJpy, formExchangeRate.value)
})

/** 防止金額 watch 之間循環觸發的 flag */
let syncingOrder = false

// 數量、匯率或新商品定價變動時，自動重新計算小計
watch(
  [
    () => formQuantity.value,
    () => formExchangeRate.value,
    () => formNewProductPriceJpy.value,
    () => formNewProductExchangeRate.value,
    () => formNewProductPriceTwd.value,
  ],
  () => {
    const qty = formQuantity.value
    if (!qty) return

    if (isNewProduct.value) {
      if (!isAdjustRate.value) {
        formExchangeRate.value = formNewProductExchangeRate.value ?? 0
        formSubtotalJpy.value = qty * (formNewProductPriceJpy.value ?? 0)
        formSubtotalTwd.value = qty * (formNewProductPriceTwd.value ?? 0)
      }
    } else if (selectedProduct.value && !syncingOrder) {
      syncingOrder = true
      const rate = formExchangeRate.value ?? selectedProduct.value.exchangeRate
      formSubtotalJpy.value = qty * selectedProduct.value.priceJpy
      formSubtotalTwd.value = qty * calcPriceTwd(selectedProduct.value.priceJpy, rate)
      syncingOrder = false
    } else if (editProductInfo.value && !syncingOrder) {
      syncingOrder = true
      const rate = formExchangeRate.value ?? editProductInfo.value.exchangeRate
      formSubtotalJpy.value = qty * editProductInfo.value.priceJpy
      formSubtotalTwd.value = qty * calcPriceTwd(editProductInfo.value.priceJpy, rate)
      syncingOrder = false
    }
  },
)

// 手動調整台幣小計時，反推匯率
watch(
  () => formSubtotalTwd.value,
  (twd) => {
    if (syncingOrder || !twd || !isAdjustRate.value || !formSubtotalJpy.value) return
    syncingOrder = true
    formExchangeRate.value = parseFloat((twd / formSubtotalJpy.value).toFixed(4))
    syncingOrder = false
  },
  { flush: 'sync' },
)

/**
 * 使用者從下拉選取商品後，帶入商品定價與匯率並重置調整旗標
 * @param product - 選取的商品完整資料
 */
function onSelectProduct(product: ProductsResBase) {
  selectedProduct.value = product
  formExchangeRate.value = product.exchangeRate
  isAdjustRate.value = false
}

/**
 * 切換至新增商品模式，清空商品相關欄位
 */
function clickAddProduct() {
  isNewProduct.value = true
  formProductOption.value = undefined
  formExchangeRate.value = null
  formSubtotalJpy.value = null
  formSubtotalTwd.value = null
}

/**
 * 開啟新增訂單彈窗，設定預設數量與訂單狀態
 */
function createOrder() {
  modalMode.value = 1
  formQuantity.value = 1
  formOrderStatusOption.value = { value: '1', name: '已喊單' }
  isVisible.value = true
}

/**
 * 開啟編輯訂單彈窗，並將現有資料填入表單
 * @param currentData - 要編輯的訂單資料
 */
function editOrder(currentData: OrderQueryContent) {
  modalMode.value = 2
  currentOrderId.value = currentData.id
  formCustomerOption.value = {
    value: currentData.customerId.toString(),
    name: currentData.customerName,
  }
  editCustomerName.value = currentData.customerName
  formProductOption.value = {
    value: currentData.productId.toString(),
    name: currentData.productName,
  }
  editProductInfo.value = {
    name: currentData.productName,
    priceJpy: currentData.quantity > 0 ? currentData.subtotalJpy / currentData.quantity : 0,
    priceTwd: currentData.unitTwd,
    exchangeRate: currentData.exchangeRate,
  }
  formQuantity.value = currentData.quantity
  formExchangeRate.value = currentData.exchangeRate
  formSubtotalJpy.value = currentData.subtotalJpy
  formSubtotalTwd.value = currentData.subtotalTwd
  formOrderStatusOption.value = {
    value: currentData.orderStatus,
    name: currentData.orderStatusName,
  }
  formNote.value = currentData.note
  formNonBonusTarget.value = currentData.nonBonusTarget
  formIsFixedRate.value = currentData.isFixedRate
  formNonCutTarget.value = currentData.nonCutTarget
  formPurchaseConfirm.value = currentData.purchaseConfirm
  isVisible.value = true
}

/**
 * 開啟刪除訂單確認彈窗
 * @param currentData - 要刪除的訂單資料
 */
function deleteOrder(currentData: OrderQueryContent) {
  modalMode.value = 3
  currentOrderId.value = currentData.id
  isVisible.value = true
}

/**
 * 點擊確定前執行驗證，刪除模式跳過驗證
 */
async function beforeConfirm(): Promise<boolean> {
  if (modalMode.value === 3) return true

  // 重置所有錯誤
  Object.keys(formErrors).forEach((k) => {
    formErrors[k as keyof typeof formErrors] = ''
  })

  let valid = true

  // 新增模式驗證顧客
  if (modalMode.value === 1) {
    if (isNewCustomer.value) {
      if (!formNewCustomerName.value.trim()) {
        formErrors.newCustomerName = '顧客名稱為必填'
        valid = false
      }
      if (!formNewCustomerSource.value.trim()) {
        formErrors.newCustomerSource = '來源為必填'
        valid = false
      }
    } else if (!formCustomerOption.value) {
      formErrors.customer = '請選擇顧客'
      valid = false
    }

    // 新增模式驗證商品
    if (isNewProduct.value) {
      if (!formNewProductName.value.trim()) {
        formErrors.newProductName = '商品名稱為必填'
        valid = false
      }
      if (!formNewProductPriceJpy.value) {
        formErrors.newProductPriceJpy = '日幣定價為必填'
        valid = false
      }
      if (!formNewProductExchangeRate.value) {
        formErrors.newProductExchangeRate = '匯率為必填'
        valid = false
      }
      if (!formNewProductPriceTwd.value) {
        formErrors.newProductPriceTwd = '台幣定價為必填'
        valid = false
      }
    } else if (!formProductOption.value) {
      formErrors.product = '請選擇商品'
      valid = false
    }
  }

  // 數量必填（新增與修改皆驗證）
  if (!formQuantity.value) {
    formErrors.quantity = '數量為必填'
    valid = false
  }

  return valid
}

/**
 * 執行新增、修改或刪除 API
 * 若為新增模式且選擇新增顧客／商品，會先建立顧客／商品再建立訂單
 */
async function confirm() {
  /** 最終使用的顧客 ID */
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

  /** 最終使用的商品 ID */
  let productId = Number(formProductOption.value?.value ?? 0)

  if (isNewProduct.value) {
    const newProduct = await productsApi.postProducts({
      eventId: Number(props.eventId),
      channelId: Number(props.shopId),
      name: formNewProductName.value,
      priceJpy: formNewProductPriceJpy.value ?? 0,
      exchangeRate: formNewProductExchangeRate.value ?? 0,
      priceTwd: formNewProductPriceTwd.value ?? 0,
      image: formNewProductImage.value,
    })
    productId = newProduct.id
  }

  /** 訂單請求 body */
  const req = {
    eventId: Number(props.eventId),
    channelId: Number(props.shopId),
    customerId,
    productId,
    quantity: formQuantity.value ?? 0,
    exchangeRate: formExchangeRate.value ?? undefined,
    subtotalJpy: formSubtotalJpy.value ?? undefined,
    subtotalTwd: formSubtotalTwd.value ?? undefined,
    orderStatus: formOrderStatusOption.value?.value ?? '',
    note: formNote.value,
    nonBonusTarget: formNonBonusTarget.value,
    isFixedRate: formIsFixedRate.value,
    nonCutTarget: formNonCutTarget.value,
    purchaseConfirm: formPurchaseConfirm.value,
  }
  if (modalMode.value === 1) await orderApi.postOrders(req)
  if (modalMode.value === 2) await orderApi.patchOrders(currentOrderId.value, req)
  if (modalMode.value === 3) await orderApi.deleteOrders(currentOrderId.value)
  closeModal()
  emit('confirmed')
}

/**
 * 關閉彈窗並重置所有表單欄位
 */
function closeModal() {
  currentOrderId.value = 0
  formCustomerOption.value = undefined
  formProductOption.value = undefined
  selectedProduct.value = undefined
  editProductInfo.value = undefined
  editCustomerName.value = ''
  isAdjustRate.value = false
  isNewCustomer.value = false
  isNewProduct.value = false
  formNewCustomerName.value = ''
  formNewCustomerSource.value = ''
  formHasMessagedOfficial.value = false
  formIsDiscount.value = false
  formIsBoss.value = false
  formNewCustomerNote.value = ''
  formNewProductName.value = ''
  formNewProductPriceJpy.value = null
  formNewProductExchangeRate.value = null
  formNewProductPriceTwd.value = null
  formNewProductImage.value = ''
  formQuantity.value = null
  formExchangeRate.value = null
  formSubtotalJpy.value = null
  formSubtotalTwd.value = null
  formOrderStatusOption.value = undefined
  formNote.value = ''
  formNonBonusTarget.value = false
  formIsFixedRate.value = false
  formNonCutTarget.value = false
  formPurchaseConfirm.value = false
  Object.keys(formErrors).forEach((k) => {
    formErrors[k as keyof typeof formErrors] = ''
  })
  isVisible.value = false
}

defineExpose({ createOrder, editOrder, deleteOrder })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增訂單' : '編輯訂單'"
    :confirmText="
      modalMode === 3
        ? '您確定要刪除此訂單嗎？'
        : isNewProduct
          ? `您確定要新增此商品，並${modalMode === 1 ? '新增' : '修改'}此訂單嗎？`
          : modalMode === 1
            ? '您確定要新增此訂單嗎？'
            : '您確定要修改此訂單嗎？'
    "
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="600px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode === 2 && editCustomerName && editProductInfo">
        {{ editCustomerName }} - {{ editProductInfo.name }}
        <span class="productInfo" style="margin-top: 0.25rem">
          <span>日幣定價：¥{{ editProductInfo.priceJpy }}</span>
          <span>台幣單價：NT${{ editUnitTwd ?? editProductInfo.priceTwd }}</span>
          <span>匯率：{{ editProductInfo.exchangeRate }}</span>
        </span>
      </div>
      <div class="formGrid">
        <div v-if="modalMode === 1 && !isNewCustomer">
          <customer-select-component
            required
            @selectOption="formCustomerOption = $event"
          ></customer-select-component>
          <span v-if="formErrors.customer" class="field-error">{{ formErrors.customer }}</span>
          <div class="addLink" @click="isNewCustomer = true">新增顧客</div>
        </div>
        <template v-if="isNewCustomer">
          <new-customer-form
            v-model:name="formNewCustomerName"
            v-model:source="formNewCustomerSource"
            v-model:hasMessagedOfficial="formHasMessagedOfficial"
            v-model:isDiscount="formIsDiscount"
            v-model:isBoss="formIsBoss"
            v-model:note="formNewCustomerNote"
            :errors="{ name: formErrors.newCustomerName || undefined, source: formErrors.newCustomerSource || undefined }"
          />
          <div class="addLink" @click="isNewCustomer = false">返回選擇顧客</div>
        </template>

        <div v-if="!isNewProduct && modalMode === 1">
          <product-select-component
            required
            :eventId="props.eventId"
            :channelId="props.shopId"
            :defaultValue="formProductOption"
            @selectOption="formProductOption = $event"
            @selectProduct="onSelectProduct"
            style="margin-bottom: 0"
          />
          <span v-if="formErrors.product" class="field-error">{{ formErrors.product }}</span>
          <div class="addLink" @click="clickAddProduct">找不到商品？新增商品</div>
        </div>
        <div v-if="selectedProduct && !isNewProduct && modalMode === 1" class="productInfo">
          <span>日幣定價：¥{{ selectedProduct.priceJpy }}</span>
          <span>台幣定價：NT${{ selectedProduct.priceTwd }}</span>
          <span>匯率：{{ selectedProduct.exchangeRate }}</span>
        </div>

        <template v-if="isNewProduct">
          <new-product-form
            v-model:name="formNewProductName"
            v-model:priceJpy="formNewProductPriceJpy"
            v-model:exchangeRate="formNewProductExchangeRate"
            v-model:priceTwd="formNewProductPriceTwd"
            v-model:image="formNewProductImage"
            :errors="{
              name: formErrors.newProductName || undefined,
              priceJpy: formErrors.newProductPriceJpy || undefined,
              exchangeRate: formErrors.newProductExchangeRate || undefined,
              priceTwd: formErrors.newProductPriceTwd || undefined,
            }"
          />
          <div class="addLink" @click="isNewProduct = false">返回選擇商品</div>
        </template>

        <div>
          <text-input
            label="數量"
            v-model:value="formQuantity"
            required
            :error-message="formErrors.quantity"
          />
        </div>
        <div>
          <text-input label="匯率" v-model:value="formExchangeRate" :disabled="!isAdjustRate" />
          <checkbox-input label="調整數值" v-model="isAdjustRate" class="adjustRateCheckbox" />
        </div>
        <text-input label="小計 (日幣)" v-model:value="formSubtotalJpy" :disabled="true" />
        <text-input label="小計 (台幣)" v-model:value="formSubtotalTwd" :disabled="true" />
        <order-status-select-component
          :defaultValue="formOrderStatusOption"
          @selectOption="formOrderStatusOption = $event"
        />
        <text-input label="備註" v-model:value="formNote" />

        <checkbox-input label="非特典對象" v-model="formNonBonusTarget" />
        <checkbox-input label="固定匯率" v-model="formIsFixedRate" />
        <checkbox-input label="非分潤對象" v-model="formNonCutTarget" />
        <checkbox-input label="採購確認" v-model="formPurchaseConfirm" />
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.productInfo {
  grid-column: span 2;
  display: flex;
  gap: 1.5rem;
  font-size: 0.8rem;
  color: #888;
  margin-top: 0;
}
.adjustRateCheckbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  cursor: pointer;
  align-self: flex-end;
}
.addLink {
  font-size: 0.85rem;
  color: var(--color-primary);
  cursor: pointer;
  margin-top: 0.4rem;
  &:hover {
    text-decoration: underline;
  }
}
.formGrid {
  display: flex;
  gap: 1.5rem;
  padding: 0 0.5rem;
  flex-wrap: wrap;
  align-items: start;
  margin-top: 1rem;
  @media (max-width: 768px) {
    gap: 0.25rem;
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
