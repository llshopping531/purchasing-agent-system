<script setup lang="ts">
import { ref, watch } from 'vue'
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

const props = defineProps<{ eventId: string; shopId: string }>()
const emit = defineEmits<{ (e: 'confirmed'): void }>()

// modal state
const isVisible = ref(false)
// 1新增 2修改 3刪除
const modalMode = ref<1 | 2 | 3>(1)
const currentOrderId = ref(0)

// 顧客
const formCustomerOption = ref<Option | undefined>(undefined)
const isNewCustomer = ref(false)
const formNewCustomerName = ref('')
const formNewCustomerSource = ref('')
const formHasMessagedOfficial = ref(false)
const formIsDiscount = ref(false)
const formIsBoss = ref(false)
const formNewCustomerNote = ref('')

// 商品
const formProductOption = ref<Option | undefined>(undefined)
const selectedProduct = ref<ProductsResBase | undefined>(undefined)
const editProductInfo = ref<
  { name: string; priceJpy: number; priceTwd: number; exchangeRate: number } | undefined
>(undefined)
const editCustomerName = ref('')
const isNewProduct = ref(false)
const formNewProductName = ref('')
const formNewProductPriceJpy = ref<number | null>(null)
const formNewProductExchangeRate = ref<number | null>(null)
const formNewProductPriceTwd = ref<number | null>(null)
const formNewProductImage = ref('')

// 訂單
const isAdjustRate = ref(false)
const formQuantity = ref<number | null>(null)
const formExchangeRate = ref<number | null>(null)
const formSubtotalJpy = ref<number | null>(null)
const formSubtotalTwd = ref<number | null>(null)
const formOrderStatusOption = ref<Option | undefined>(undefined)
const formNote = ref('')
const formNonBonusTarget = ref(false)
const formIsFixedRate = ref(false)
const formNonCutTarget = ref(false)
const formPurchaseConfirm = ref(false)

function calcPriceTwd(priceJpy: number, rate: number): number {
  const price = priceJpy * rate
  const floored = Math.floor(price)
  return floored % 5 === 0 ? floored : Math.ceil(price / 5) * 5
}

let syncingOrder = false

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
    }
  },
)

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

function onSelectProduct(product: ProductsResBase) {
  selectedProduct.value = product
  formExchangeRate.value = product.exchangeRate
  isAdjustRate.value = false
}

function clickAddProduct() {
  isNewProduct.value = true
  formProductOption.value = undefined
  formExchangeRate.value = null
  formSubtotalJpy.value = null
  formSubtotalTwd.value = null
}

// --- 對外公開的開啟方法 ---

function createOrder() {
  modalMode.value = 1
  formQuantity.value = 1
  formOrderStatusOption.value = { value: '1', name: '已喊單' }
  isVisible.value = true
}

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

function deleteOrder(currentData: OrderQueryContent) {
  modalMode.value = 3
  currentOrderId.value = currentData.id
  isVisible.value = true
}

async function confirm() {
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
      priceJpy: formNewProductPriceJpy.value ?? 0,
      exchangeRate: formNewProductExchangeRate.value ?? 0,
      priceTwd: formNewProductPriceTwd.value ?? 0,
      image: formNewProductImage.value,
    })
    productId = newProduct.id
  }

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
    width="600px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode === 2 && editCustomerName && editProductInfo" style="margin-top: 1rem">
        {{ editCustomerName }} - {{ editProductInfo.name }}
        <span class="productInfo" style="margin-top: 0.25rem">
          <span>日幣定價：¥{{ editProductInfo.priceJpy }}</span>
          <span>台幣單價：NT${{ editProductInfo.priceTwd }}</span>
          <span>匯率：{{ editProductInfo.exchangeRate }}</span>
        </span>
      </div>
      <div class="formGrid">
        <div v-if="modalMode === 1 && !isNewCustomer">
          <customer-select-component
            @selectOption="formCustomerOption = $event"
          ></customer-select-component>
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
          />
          <div class="addLink" @click="isNewCustomer = false">返回選擇顧客</div>
        </template>

        <div v-if="!isNewProduct && modalMode === 1">
          <product-select-component
            :eventId="props.eventId"
            :channelId="props.shopId"
            :defaultValue="formProductOption"
            @selectOption="formProductOption = $event"
            @selectProduct="onSelectProduct"
            style="margin-bottom: 0"
          />
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
          />
          <div class="addLink" @click="isNewProduct = false">返回選擇商品</div>
        </template>

        <text-input label="數量" v-model:value="formQuantity" />
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
  color: #8cbfa4;
  cursor: pointer;
  margin-top: 0.4rem;
  &:hover {
    text-decoration: underline;
  }
}
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1.5rem;
  padding: 0 0.5rem;
}
</style>
