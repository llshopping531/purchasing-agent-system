<script setup lang="ts">
/**
 * 活動成本新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createCost / editCost / deleteCost 供父層呼叫
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import PurchaserSelectComponent from '@/components/inputs/selects/PurchaserSelectComponent.vue'
import { eventCostsApi } from '@/services/api/offline/event-costs/event-costs-api'
import type { QueryEventCostItem } from '@/services/api/offline/event-costs/event-costs-api-interfaces'
import type { SelectOption } from '@/interfaces/common'

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

/** 彈窗是否顯示 */
const isVisible = ref(false)
/** 操作模式：1=新增 2=編輯 3=刪除 */
const modalMode = ref<1 | 2 | 3>(1)
/** 目標成本 ID */
const currentCostId = ref(0)
/** 當前活動 ID */
const currentEventId = ref(0)
/** 採購者 ID */
const currentPurchaser = ref<string>('1')
/** 採購者名稱（用於刪除確認顯示） */
const currentPurchaserName = ref('')

const schema = yup.object({
  item: yup.string().required('費用項目為必填'),
  fee: yup
    .number()
    .typeError('金額必須為數字')
    .required('金額為必填')
    .min(0, '金額不可為負數'),
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { item: '', fee: 0 },
})

const [currentItem] = defineField('item')
const [currentFee] = defineField('fee')

function onSelectPurchaser(opt: SelectOption<string | undefined>) {
  currentPurchaser.value = opt.value ?? '1'
}

/** 開啟新增彈窗 */
function createCost(eventId: number) {
  modalMode.value = 1
  currentEventId.value = eventId
  currentPurchaser.value = '1'
  resetForm()
  isVisible.value = true
}

/** 開啟編輯彈窗 */
function editCost(data: QueryEventCostItem) {
  modalMode.value = 2
  currentCostId.value = data.id
  currentEventId.value = data.eventId
  currentPurchaser.value = data.purchaser
  currentPurchaserName.value = data.purchaserName
  resetForm({ values: { item: data.item, fee: data.fee } })
  isVisible.value = true
}

/** 開啟刪除確認彈窗 */
function deleteCost(data: QueryEventCostItem) {
  modalMode.value = 3
  currentCostId.value = data.id
  currentEventId.value = data.eventId
  resetForm({ values: { item: data.item, fee: data.fee } })
  isVisible.value = true
}

async function beforeConfirm(): Promise<boolean> {
  if (modalMode.value === 3) return true
  const { valid } = await validate()
  return valid
}

async function confirm() {
  const snapshot = {
    eventId: currentEventId.value,
    purchaser: currentPurchaser.value,
    item: currentItem.value ?? '',
    fee: Number(currentFee.value ?? 0),
  }
  if (modalMode.value === 1) await eventCostsApi.postEventCost(snapshot)
  if (modalMode.value === 2) await eventCostsApi.patchEventCost(currentCostId.value, snapshot)
  if (modalMode.value === 3) await eventCostsApi.deleteEventCost(currentCostId.value)
  closeModal()
  emit('confirmed')
}

function closeModal() {
  currentCostId.value = 0
  currentEventId.value = 0
  currentPurchaser.value = '1'
  resetForm()
  isVisible.value = false
}

defineExpose({ createCost, editCost, deleteCost })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增活動成本' : modalMode === 2 ? '編輯活動成本' : '刪除活動成本'"
    :confirmText="
      modalMode === 3
        ? `您確定要刪除「${currentItem}」這筆成本嗎？`
        : modalMode === 1
          ? '您確定要新增此成本嗎？'
          : '您確定要儲存變更嗎？'
    "
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="460px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div class="formGrid">
        <div class="formItem">
          <purchaser-select-component
            :defaultValue="currentPurchaser"
            @selectOption="onSelectPurchaser"
          />
        </div>
        <div class="formItem">
          <text-input
            label="費用項目"
            placeholder="例：運費、保險費"
            v-model:value="currentItem"
            required
            :error-message="errors.item"
          />
        </div>
        <div class="formItem">
          <label class="num-label">
            <span class="num-title">金額<span class="required-mark">*</span></span>
            <input
              type="number"
              class="num-input"
              :class="{ 'input-error': errors.fee }"
              v-model="currentFee"
              min="0"
              placeholder="0"
            />
            <span v-if="errors.fee" class="error-message">{{ errors.fee }}</span>
          </label>
        </div>
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.formGrid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 0.5rem;
  margin-top: 1rem;
}

.formItem {
  width: 100%;
}

/* 數字輸入仿照 TextInput 樣式 */
.num-label {
  display: block;
}

.num-title {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.25rem;
  display: block;
}

.required-mark {
  display: inline;
  color: var(--color-danger, #e53e3e);
  margin-left: 0.2rem;
  font-weight: 700;
}

.num-input {
  display: block;
  padding: 0.5rem 0.875rem;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  border: 1.5px solid rgba(124, 111, 224, 0.3);
  background: var(--color-surface);
  width: 100%;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(124, 111, 224, 0.1);
  }

  &.input-error {
    border-color: var(--color-danger, #e53e3e);
    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
  }
}

.error-message {
  display: block;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
  margin-top: 0.25rem;
  font-weight: 500;
}
</style>
