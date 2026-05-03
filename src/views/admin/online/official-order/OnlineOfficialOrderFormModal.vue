<script setup lang="ts">
/**
 * 通販官方訂單新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createOrder / editOrder / deleteOrder 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入列表
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import { onlineOfficialOrdersApi } from '@/services/api/online/online-official-orders/online-official-orders-api'
import type { QueryOnlineOfficialOrdersContent } from '@/services/api/online/online-official-orders/online-official-orders-api-interfaces'

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
const currentDeleteName = ref('')

const numField = yup
  .number()
  .transform((v, o) => (o === '' ? null : v))
  .typeError('請輸入數字')
  .positive('請輸入正數')
  .nullable()
  .optional()

const schema = yup.object({
  name: yup.string().required('訂單名稱為必填'),
  note: yup.string().optional(),
  domesticShippingTotal: numField,
  internationalShippingTotal: numField,
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    note: '',
    domesticShippingTotal: null as number | null,
    internationalShippingTotal: null as number | null,
  },
})

const [name] = defineField('name')
const [note] = defineField('note')
const [domesticShippingTotal] = defineField('domesticShippingTotal')
const [internationalShippingTotal] = defineField('internationalShippingTotal')

function createOrder() {
  modalMode.value = 1
  resetForm()
  isVisible.value = true
}

function editOrder(data: QueryOnlineOfficialOrdersContent) {
  modalMode.value = 2
  currentId.value = data.id
  resetForm({
    values: {
      name: data.name,
      note: data.note ?? '',
      domesticShippingTotal: data.domesticShippingTotal ?? null,
      internationalShippingTotal: data.internationalShippingTotal ?? null,
    },
  })
  isVisible.value = true
}

function deleteOrder(data: QueryOnlineOfficialOrdersContent) {
  modalMode.value = 3
  currentId.value = data.id
  currentDeleteName.value = data.name
  isVisible.value = true
}

async function beforeConfirm(): Promise<boolean> {
  if (modalMode.value === 3) return true
  const { valid } = await validate()
  return valid
}

async function confirm() {
  const payload = {
    eventId: Number(props.eventId),
    name: name.value ?? '',
    note: note.value || undefined,
    domesticShippingTotal: domesticShippingTotal.value ?? undefined,
    internationalShippingTotal: internationalShippingTotal.value ?? undefined,
  }
  if (modalMode.value === 1) await onlineOfficialOrdersApi.postOnlineOfficialOrders(payload)
  if (modalMode.value === 2) await onlineOfficialOrdersApi.patchOnlineOfficialOrders(currentId.value, payload)
  if (modalMode.value === 3) await onlineOfficialOrdersApi.deleteOnlineOfficialOrders(currentId.value)
  closeModal()
  emit('confirmed')
}

function closeModal() {
  currentId.value = 0
  currentDeleteName.value = ''
  resetForm()
  isVisible.value = false
}

defineExpose({ createOrder, editOrder, deleteOrder })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增官方訂單' : modalMode === 2 ? '編輯官方訂單' : '刪除官方訂單'"
    :confirmText="
      modalMode === 3
        ? `您確定要刪除「${currentDeleteName}」嗎？`
        : modalMode === 1
          ? '您確定要新增此官方訂單嗎？'
          : '您確定要修改此官方訂單嗎？'
    "
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="480px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode !== 3" class="formGrid">
        <div class="formItem full">
          <text-input label="訂單名稱" v-model:value="name" required :error-message="errors.name" />
        </div>
        <div class="formItem">
          <text-input label="境內運費（總額）" v-model:value="domesticShippingTotal" :error-message="errors.domesticShippingTotal" />
        </div>
        <div class="formItem">
          <text-input label="國際運費（總額）" v-model:value="internationalShippingTotal" :error-message="errors.internationalShippingTotal" />
        </div>
        <div class="formItem full">
          <text-input label="備註" v-model:value="note" />
        </div>
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.formGrid {
  display: flex;
  gap: 1.5rem;
  padding: 0 0.5rem;
  flex-wrap: wrap;
  align-items: start;
  margin-top: 1rem;
  .formItem {
    width: calc(50% - 0.75rem);
  }
  .formItem.full {
    width: 100%;
  }
  @media (max-width: 768px) {
    gap: 0.25rem;
    .formItem,
    .formItem.full {
      width: 100%;
    }
  }
}
</style>
