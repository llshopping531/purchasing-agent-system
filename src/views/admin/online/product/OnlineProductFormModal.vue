<script setup lang="ts">
/**
 * 通販商品新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createProduct / editProduct / deleteProduct 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入商品列表
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import { onlineProductsApi } from '@/services/api/online/online-products/online-products-api'
import type { QueryOnlineProductsContent } from '@/services/api/online/online-products/online-products-api-interfaces'

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

const schema = yup.object({
  name: yup.string().required('商品名稱為必填'),
  priceTwd: yup
    .number()
    .transform((v, o) => (o === '' ? null : v))
    .typeError('請輸入數字')
    .positive('請輸入正數')
    .nullable()
    .optional(),
  weight: yup
    .number()
    .transform((v, o) => (o === '' ? null : v))
    .typeError('請輸入數字')
    .positive('請輸入正數')
    .nullable()
    .optional(),
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: '', priceTwd: null as number | null, weight: null as number | null },
})

const [name] = defineField('name')
const [priceTwd] = defineField('priceTwd')
const [weight] = defineField('weight')

function createProduct() {
  modalMode.value = 1
  resetForm()
  isVisible.value = true
}

function editProduct(data: QueryOnlineProductsContent) {
  modalMode.value = 2
  currentId.value = data.id
  resetForm({
    values: {
      name: data.name,
      priceTwd: data.priceTwd ?? null,
      weight: data.weight ?? null,
    },
  })
  isVisible.value = true
}

function deleteProduct(data: QueryOnlineProductsContent) {
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
    priceTwd: priceTwd.value ?? undefined,
    weight: weight.value ?? undefined,
  }
  if (modalMode.value === 1) await onlineProductsApi.postOnlineProducts(payload)
  if (modalMode.value === 2) await onlineProductsApi.patchOnlineProducts(currentId.value, payload)
  if (modalMode.value === 3) await onlineProductsApi.deleteOnlineProducts(currentId.value)
  closeModal()
  emit('confirmed')
}

function closeModal() {
  currentId.value = 0
  currentDeleteName.value = ''
  resetForm()
  isVisible.value = false
}

defineExpose({ createProduct, editProduct, deleteProduct })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增商品' : modalMode === 2 ? '編輯商品' : '刪除商品'"
    :confirmText="
      modalMode === 3
        ? `您確定要刪除「${currentDeleteName}」嗎？`
        : modalMode === 1
          ? '您確定要新增此商品嗎？'
          : '您確定要修改此商品嗎？'
    "
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="440px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode !== 3" class="formGrid">
        <div class="formItem full">
          <text-input label="商品名稱" v-model:value="name" required :error-message="errors.name" />
        </div>
        <div class="formItem">
          <text-input label="台幣價格" v-model:value="priceTwd" :error-message="errors.priceTwd" />
        </div>
        <div class="formItem">
          <text-input label="重量（公斤）" v-model:value="weight" :error-message="errors.weight" />
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
