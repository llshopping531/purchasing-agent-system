<script setup lang="ts">
/**
 * 顧客新增／編輯彈窗
 * 透過 defineExpose 提供 createCustomer / editCustomer 方法供父層呼叫開啟
 * 操作完成後 emit confirmed 通知父層重新載入顧客列表
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import NewCustomerForm from '@/components/forms/NewCustomerForm.vue'
import { customersApi } from '@/services/api/customers/customers-api'
import type { CustomersResBase } from '@/services/api/customers/customers-api-interfaces'

const emit = defineEmits<{
  /** 新增或修改成功後觸發，通知父層重新整理顧客列表 */
  (e: 'confirmed'): void
}>()

/** 彈窗是否顯示 */
const isVisible = ref(false)
/** 操作模式：1 = 新增，2 = 修改 */
const modalMode = ref<1 | 2>(1)
/** 修改時的目標顧客 ID */
const currentId = ref(0)

const schema = yup.object({
  name: yup.string().required('顧客名稱為必填'),
  source: yup.string().required('來源為必填'),
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: '', source: '' },
})

const [name] = defineField('name')
const [source] = defineField('source')

/** 表單欄位：是否已私訊官方 */
const hasMessagedOfficial = ref(false)
/** 表單欄位：是否享有折扣 */
const isDiscount = ref(false)
/** 表單欄位：是否為老闆 */
const isBoss = ref(false)
/** 表單欄位：備註 */
const note = ref('')

/**
 * 開啟新增顧客彈窗
 */
function createCustomer() {
  modalMode.value = 1
  resetForm()
  isVisible.value = true
}

/**
 * 開啟編輯顧客彈窗，並將現有資料填入表單
 * @param data - 要編輯的顧客資料
 */
function editCustomer(data: CustomersResBase) {
  modalMode.value = 2
  currentId.value = data.id
  resetForm({ values: { name: data.name, source: data.source } })
  hasMessagedOfficial.value = data.hasMessagedOfficial
  isDiscount.value = data.isDiscount
  isBoss.value = data.isBoss
  note.value = data.note
  isVisible.value = true
}

/**
 * 點擊確定前執行驗證，驗證失敗時阻止進入確認彈窗
 */
async function beforeConfirm(): Promise<boolean> {
  const { valid } = await validate()
  return valid
}

/**
 * 執行新增或修改 API，成功後關閉彈窗並通知父層
 */
async function confirm() {
  const req = {
    name: name.value ?? '',
    source: source.value ?? '',
    hasMessagedOfficial: hasMessagedOfficial.value,
    isDiscount: isDiscount.value,
    isBoss: isBoss.value,
    note: note.value,
  }
  if (modalMode.value === 1) await customersApi.postCustomers(req)
  if (modalMode.value === 2) await customersApi.patchCustomers(currentId.value, req)
  closeModal()
  emit('confirmed')
}

/**
 * 關閉彈窗並重置所有表單欄位
 */
function closeModal() {
  currentId.value = 0
  resetForm()
  hasMessagedOfficial.value = false
  isDiscount.value = false
  isBoss.value = false
  note.value = ''
  isVisible.value = false
}

defineExpose({ createCustomer, editCustomer })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增顧客' : '編輯顧客'"
    :confirmText="modalMode === 1 ? '您確定要新增此顧客嗎？' : '您確定要修改此顧客嗎？'"
    :beforeConfirm="beforeConfirm"
    width="500px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div class="formGrid">
        <new-customer-form
          v-model:name="name"
          v-model:source="source"
          v-model:hasMessagedOfficial="hasMessagedOfficial"
          v-model:isDiscount="isDiscount"
          v-model:isBoss="isBoss"
          v-model:note="note"
          :errors="errors"
        />
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
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
}
</style>
