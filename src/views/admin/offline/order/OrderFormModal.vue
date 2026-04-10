<script setup lang="ts">
/**
 * 訂單修改／刪除彈窗
 * 透過 defineExpose 提供 editOrder / deleteOrder 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入訂單列表
 */
import { ref, reactive, watch } from 'vue'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import { orderApi } from '@/services/api/order/order-api'
import type { OrderQueryContent } from '@/services/api/order/order-api-interfaces'

const props = defineProps<{
  /** 目前選取的活動 ID（字串形式） */
  eventId: string
  /** 目前選取的通路 ID（字串形式） */
  shopId: string
}>()

const emit = defineEmits<{
  /** 修改或刪除成功後觸發，通知父層重新整理訂單列表 */
  (e: 'confirmed'): void
}>()

/** 彈窗是否顯示 */
const isVisible = ref(false)
/** 操作模式：2 = 修改，3 = 刪除 */
const modalMode = ref<2 | 3>(2)
/** 目標訂單 ID */
const currentOrderId = ref(0)
/** 目標顧客 ID */
const currentCustomerId = ref(0)
/** 目標商品 ID */
const currentProductId = ref(0)

/** 編輯時顯示的顧客名稱 */
const editCustomerName = ref('')
/** 編輯時顯示的商品基本資訊 */
const editProductInfo = ref<
  { name: string; priceJpy: number; priceTwd: number; exchangeRate: number } | undefined
>(undefined)

// ── 訂單欄位 ──────────────────────────────────────────────────
/** 訂購數量 */
const formQuantity = ref<number | null>(null)
/** 匯率（供 API 使用） */
const formExchangeRate = ref<number | null>(null)
/** 小計日幣（供 API 使用） */
const formSubtotalJpy = ref<number | null>(null)
/** 小計台幣（供 API 使用） */
const formSubtotalTwd = ref<number | null>(null)
/** 訂單狀態（供 API 使用） */
const formOrderStatus = ref('')
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

const formErrors = reactive({ quantity: '' })
watch(formQuantity, () => {
  formErrors.quantity = ''
})

/**
 * 開啟編輯訂單彈窗，並將現有資料填入表單
 * @param currentData - 要編輯的訂單資料
 */
function editOrder(currentData: OrderQueryContent) {
  modalMode.value = 2
  currentOrderId.value = currentData.id
  currentCustomerId.value = currentData.customerId
  currentProductId.value = currentData.productId
  editCustomerName.value = currentData.customerName
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
  formOrderStatus.value = currentData.orderStatus
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
  formErrors.quantity = ''
  if (formQuantity.value === null || formQuantity.value === undefined) {
    formErrors.quantity = '數量為必填'
    return false
  }
  if (formQuantity.value <= 0) {
    formErrors.quantity = '數量不得為 0'
    return false
  }
  return true
}

/**
 * 執行修改或刪除 API，成功後關閉彈窗並通知父層
 */
async function confirm() {
  if (modalMode.value === 2) {
    await orderApi.patchOrders(currentOrderId.value, {
      eventId: Number(props.eventId),
      channelId: Number(props.shopId),
      customerId: currentCustomerId.value,
      productId: currentProductId.value,
      quantity: formQuantity.value ?? 0,
      exchangeRate: formExchangeRate.value ?? undefined,
      subtotalJpy: formSubtotalJpy.value ?? undefined,
      subtotalTwd: formSubtotalTwd.value ?? undefined,
      orderStatus: formOrderStatus.value,
      note: formNote.value,
      nonBonusTarget: formNonBonusTarget.value,
      isFixedRate: formIsFixedRate.value,
      nonCutTarget: formNonCutTarget.value,
      purchaseConfirm: formPurchaseConfirm.value,
    })
  }
  if (modalMode.value === 3) {
    await orderApi.deleteOrders(currentOrderId.value)
  }
  closeModal()
  emit('confirmed')
}

/**
 * 關閉彈窗並重置所有表單欄位
 */
function closeModal() {
  currentOrderId.value = 0
  currentCustomerId.value = 0
  currentProductId.value = 0
  editCustomerName.value = ''
  editProductInfo.value = undefined
  formQuantity.value = null
  formExchangeRate.value = null
  formSubtotalJpy.value = null
  formSubtotalTwd.value = null
  formOrderStatus.value = ''
  formNote.value = ''
  formNonBonusTarget.value = false
  formIsFixedRate.value = false
  formNonCutTarget.value = false
  formPurchaseConfirm.value = false
  formErrors.quantity = ''
  isVisible.value = false
}

defineExpose({ editOrder, deleteOrder })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    name="編輯訂單"
    :confirmText="modalMode === 3 ? '您確定要刪除此訂單嗎？' : '您確定要修改此訂單嗎？'"
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="500px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode === 2 && editCustomerName && editProductInfo">
        {{ editCustomerName }} - {{ editProductInfo.name }}
        <span class="productInfo">
          <span>日幣定價：¥{{ editProductInfo.priceJpy }}</span>
          <span>台幣單價：NT${{ editProductInfo.priceTwd }}</span>
          <span>匯率：{{ editProductInfo.exchangeRate }}</span>
        </span>
      </div>
      <div class="form">
        <div class="row">
          <div class="text-input">
            <text-input
              label="數量"
              v-model:value="formQuantity"
              required
              :error-message="formErrors.quantity"
            />
          </div>
          <div class="text-input">
            <text-input label="備註" v-model:value="formNote" />
          </div>
        </div>
        <div class="row checkbox">
          <checkbox-input label="固定匯率" v-model="formIsFixedRate" />
          <checkbox-input label="非分潤對象" v-model="formNonCutTarget" />
        </div>
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.productInfo {
  display: flex;
  gap: 1.5rem;
  font-size: 0.8rem;
  color: #888;
  margin-top: 0.25rem;
}
.form {
  margin-top: 1rem;
  .row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    &:last-child {
      margin-bottom: 0;
    }
    &.checkbox {
      justify-content: start;
    }
    .text-input {
      width: calc(50% - 0.5rem);
    }
  }
}
</style>
