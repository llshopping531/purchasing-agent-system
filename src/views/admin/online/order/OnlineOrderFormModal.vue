<script setup lang="ts">
/**
 * 通販訂單新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createOrder / editOrder / deleteOrder 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入訂單列表
 */
import { ref, reactive, watch, onMounted } from 'vue'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import CustomerSelectComponent from '@/components/inputs/selects/CustomerSelectComponent.vue'
import { onlineProductsApi } from '@/services/api/online/online-products/online-products-api'
import { onlineOrdersApi } from '@/services/api/online/online-orders/online-orders-api'
import { onlineOfficialOrdersApi } from '@/services/api/online/online-official-orders/online-official-orders-api'
import type { QueryOnlineOrdersContent } from '@/services/api/online/online-orders/online-orders-api-interfaces'
import type { OnlineProductsResBase } from '@/services/api/online/online-products/online-products-api-interfaces'
import type { OnlineOfficialOrdersResBase } from '@/services/api/online/online-official-orders/online-official-orders-api-interfaces'
import type { CustomersResBase } from '@/services/api/offline/customers/customers-api-interfaces'
import type { SelectOption } from '@/interfaces/common'

const props = defineProps<{
  /** 目前選取的通販活動 ID */
  eventId: string
}>()

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

const isVisible = ref(false)
/** 操作模式：1 = 新增，2 = 修改，3 = 刪除 */
const modalMode = ref<1 | 2 | 3>(1)
const currentId = ref(0)

/** 通販商品下拉選項 */
const productOptions = ref<SelectOption<OnlineProductsResBase | null>[]>([
  { name: '請選擇商品', value: null },
])

/** 官方訂單下拉選項 */
const officialOrderOptions = ref<SelectOption<OnlineOfficialOrdersResBase | null>[]>([
  { name: '無', value: null },
])

// ── 表單欄位 ────────────────────────────────────────────────────
const formCustomerOption = ref<SelectOption<CustomersResBase | undefined> | undefined>(undefined)
const formProductOption = ref<SelectOption<OnlineProductsResBase | null> | undefined>(undefined)
const formOfficialOrderOption = ref<SelectOption<OnlineOfficialOrdersResBase | null>>({ name: '無', value: null })
const formQuantity = ref<number | null>(null)
const formDomesticShipping = ref<number | null>(null)
const formInternationalShipping = ref<number | null>(null)
const formNote = ref('')

const formErrors = reactive({ customer: '', product: '', quantity: '' })
watch(formCustomerOption, () => { formErrors.customer = '' })
watch(formProductOption, () => { formErrors.product = '' })
watch(formQuantity, () => { formErrors.quantity = '' })

onMounted(() => {
  loadProductOptions()
  loadOfficialOrderOptions()
})

watch(() => props.eventId, () => {
  loadProductOptions()
  loadOfficialOrderOptions()
})

async function loadProductOptions() {
  if (!props.eventId) return
  const res = await onlineProductsApi.getOnlineProducts({ eventId: Number(props.eventId), size: 1000 })
  productOptions.value = [
    { name: '請選擇商品', value: null },
    ...res.content.map((p) => ({ name: p.name, value: p })),
  ]
}

async function loadOfficialOrderOptions() {
  if (!props.eventId) return
  const res = await onlineOfficialOrdersApi.getOnlineOfficialOrdersByEvent(Number(props.eventId))
  officialOrderOptions.value = [
    { name: '無', value: null },
    ...res.map((o) => ({ name: o.name, value: o })),
  ]
}

function createOrder() {
  modalMode.value = 1
  resetFields()
  isVisible.value = true
}

function editOrder(data: QueryOnlineOrdersContent) {
  modalMode.value = 2
  currentId.value = data.id
  formCustomerOption.value = {
    value: { id: data.customerId, name: data.customerName } as CustomersResBase,
    name: data.customerName,
  }
  const product = productOptions.value.find((p) => p.value?.id === data.productId)
  formProductOption.value = product ?? { name: data.productName, value: null }
  formQuantity.value = data.quantity
  formDomesticShipping.value = data.domesticShipping ?? null
  formInternationalShipping.value = data.internationalShipping ?? null
  formNote.value = data.note ?? ''
  formOfficialOrderOption.value = officialOrderOptions.value.find((o) => o.value?.id === data.officialOrderId) ?? { name: '無', value: null }
  isVisible.value = true
}

function deleteOrder(data: QueryOnlineOrdersContent) {
  modalMode.value = 3
  currentId.value = data.id
  isVisible.value = true
}

async function beforeConfirm(): Promise<boolean> {
  if (modalMode.value === 3) return true
  formErrors.customer = ''
  formErrors.product = ''
  formErrors.quantity = ''
  let valid = true
  if (!formCustomerOption.value?.value) {
    formErrors.customer = '請選擇顧客'
    valid = false
  }
  if (!formProductOption.value?.value) {
    formErrors.product = '請選擇商品'
    valid = false
  }
  if (formQuantity.value === null || formQuantity.value === undefined) {
    formErrors.quantity = '數量為必填'
    valid = false
  } else if (formQuantity.value <= 0) {
    formErrors.quantity = '數量不得為 0'
    valid = false
  }
  return valid
}

async function confirm() {
  console.log(formOfficialOrderOption)
  const payload = {
    eventId: Number(props.eventId),
    customerId: formCustomerOption.value?.value?.id ?? 0,
    productId: formProductOption.value?.value?.id ?? 0,
    officialOrderId: formOfficialOrderOption.value.value?.id ?? undefined,
    quantity: formQuantity.value ?? 0,
    domesticShipping: formDomesticShipping.value ?? undefined,
    internationalShipping: formInternationalShipping.value ?? undefined,
    note: formNote.value || undefined,
  }
  if (modalMode.value === 1) await onlineOrdersApi.postOnlineOrders(payload)
  if (modalMode.value === 2) await onlineOrdersApi.patchOnlineOrders(currentId.value, payload)
  if (modalMode.value === 3) await onlineOrdersApi.deleteOnlineOrders(currentId.value)
  closeModal()
  emit('confirmed')
}

function resetFields() {
  currentId.value = 0
  formCustomerOption.value = undefined
  formProductOption.value = undefined
  formQuantity.value = null
  formDomesticShipping.value = null
  formInternationalShipping.value = null
  formNote.value = ''
  formOfficialOrderOption.value = { name: '無', value: null }
  formErrors.customer = ''
  formErrors.product = ''
  formErrors.quantity = ''
}

function closeModal() {
  resetFields()
  isVisible.value = false
}

defineExpose({ createOrder, editOrder, deleteOrder })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增訂單' : modalMode === 2 ? '編輯訂單' : '刪除訂單'"
    :confirmText="
      modalMode === 3
        ? '您確定要刪除此訂單嗎？'
        : modalMode === 1
          ? '您確定要新增此訂單嗎？'
          : '您確定要修改此訂單嗎？'
    "
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="520px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode !== 3" class="form">
        <div class="row">
          <div class="field">
            <customer-select-component
              required
              :defaultValue="formCustomerOption"
              @selectOption="formCustomerOption = $event"
            />
            <span v-if="formErrors.customer" class="field-error">{{ formErrors.customer }}</span>
          </div>
          <div class="field">
            <select-component
              label="商品"
              :optionList="productOptions"
              :defaultValue="formProductOption ?? productOptions[0]"
              :required="true"
              @selectOption="formProductOption = $event"
            />
            <span v-if="formErrors.product" class="field-error">{{ formErrors.product }}</span>
          </div>
        </div>
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
            <select-component
              label="官方訂單"
              :optionList="officialOrderOptions"
              :defaultValue="formOfficialOrderOption"
              @selectOption="formOfficialOrderOption = $event"
            />
          </div>
        </div>
        <div class="row">
          <div class="text-input">
            <text-input label="日本境內運費" v-model:value="formDomesticShipping" />
          </div>
          <div class="text-input">
            <text-input label="國際運費" v-model:value="formInternationalShipping" />
          </div>
        </div>
        <div class="row">
          <div class="text-input">
            <text-input label="備註" v-model:value="formNote" />
          </div>
        </div>
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
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
    .field {
      flex: 1;
      min-width: 180px;
    }
    .text-input {
      width: calc(50% - 0.5rem);
    }
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
