<script setup lang="ts">
/**
 * 活動新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createEvent / editEvent / deleteEvent 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入活動列表
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import { eventApi } from '@/services/api/events/events-api'
import type { QueryEventsContent } from '@/services/api/events/events-api-interfaces'

const emit = defineEmits<{
  /** 新增、修改或刪除成功後觸發，通知父層重新整理活動列表 */
  (e: 'confirmed'): void
}>()

/** 彈窗是否顯示 */
const isVisible = ref(false)
/** 操作模式：1 = 新增，2 = 修改，3 = 刪除 */
const modalMode = ref<1 | 2 | 3>(1)
/** 目標活動 ID */
const currentEventId = ref(0)

const schema = yup.object({
  name: yup.string().required('活動名稱為必填'),
  startDate: yup.string().required('開始日期為必填'),
  endDate: yup.string().required('結束日期為必填'),
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: '', startDate: '', endDate: '' },
})

const [currentEventName] = defineField('name')
const [currentStartDate] = defineField('startDate')
const [currentEndDate] = defineField('endDate')

/** 表單欄位：是否隱藏 */
const currentIsHidden = ref(false)
/** 表單欄位：是否鎖定 */
const currentIsLocked = ref(false)

/**
 * 開啟新增活動彈窗
 */
function createEvent() {
  modalMode.value = 1
  resetForm()
  isVisible.value = true
}

/**
 * 開啟編輯活動彈窗，並將現有資料填入表單
 * @param currentData - 要編輯的活動資料
 */
function editEvent(currentData: QueryEventsContent) {
  modalMode.value = 2
  currentEventId.value = currentData.id
  resetForm({
    values: {
      name: currentData.name,
      startDate: currentData.startDate,
      endDate: currentData.endDate,
    },
  })
  currentIsHidden.value = !currentData.isHidden
  currentIsLocked.value = currentData.isLocked
  isVisible.value = true
}

/**
 * 開啟刪除活動確認彈窗
 * @param currentData - 要刪除的活動資料
 */
function deleteEvent(currentData: QueryEventsContent) {
  modalMode.value = 3
  currentEventId.value = currentData.id
  resetForm({ values: { name: currentData.name, startDate: '', endDate: '' } })
  isVisible.value = true
}

/**
 * 點擊確定前執行驗證，刪除模式跳過驗證
 */
async function beforeConfirm(): Promise<boolean> {
  if (modalMode.value === 3) return true
  const { valid } = await validate()
  return valid
}

/**
 * 執行新增、修改或刪除 API，成功後關閉彈窗並通知父層
 */
async function confirm() {
  const eventData = {
    name: currentEventName.value ?? '',
    startDate: currentStartDate.value ?? '',
    endDate: currentEndDate.value ?? '',
    isHidden: !currentIsHidden.value,
    isLocked: currentIsLocked.value,
  }
  if (modalMode.value === 1) await eventApi.postEvents(eventData)
  if (modalMode.value === 2) await eventApi.patchEvents(currentEventId.value, eventData)
  if (modalMode.value === 3) await eventApi.deleteEvents(currentEventId.value)
  closeModal()
  emit('confirmed')
}

/**
 * 關閉彈窗並重置所有表單欄位
 */
function closeModal() {
  currentEventId.value = 0
  resetForm()
  currentIsHidden.value = false
  currentIsLocked.value = false
  isVisible.value = false
}

defineExpose({ createEvent, editEvent, deleteEvent })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增活動' : '編輯活動'"
    :confirmText="
      modalMode === 3
        ? `您確定要刪除 ${currentEventName} 嗎？`
        : modalMode === 1
          ? '您確定要新增此活動嗎？'
          : '您確定要編輯此活動嗎？'
    "
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="500px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div class="formGrid">
        <div class="formItem">
          <text-input
            label="活動名稱"
            v-model:value="currentEventName"
            required
            :error-message="errors.name"
          />
        </div>
        <div class="formItem-checkbox">
          <checkbox-input label="是否顯示" v-model="currentIsHidden" style="margin-top: auto" />

          <checkbox-input label="是否鎖定" v-model="currentIsLocked" style="margin-top: auto" />
        </div>
        <div class="formItem">
          <text-input
            label="開始日期"
            v-model:value="currentStartDate"
            required
            :error-message="errors.startDate"
          />
        </div>
        <div class="formItem">
          <text-input
            label="結束日期"
            v-model:value="currentEndDate"
            required
            :error-message="errors.endDate"
          />
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
  @media (max-width: 768px) {
    gap: 0.25rem;
    .formItem {
      width: 100%;
    }
    .formItem-checkbox {
      width: 100%;
      display: flex;
    }
  }
}
</style>
