<script setup lang="ts">
/**
 * 活動新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createEvent / editEvent / deleteEvent 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入活動列表
 */
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import { eventApi, type EventData } from '@/services/api/event-api'
import { ref } from 'vue'

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
/** 表單欄位：活動名稱（刪除模式下用於顯示確認訊息） */
const currentEventName = ref('')
/** 表單欄位：開始日期 */
const currentStartDate = ref('')
/** 表單欄位：結束日期 */
const currentEndDate = ref('')
/** 表單欄位：是否隱藏 */
const currentIsHidden = ref(false)

/**
 * 開啟新增活動彈窗
 */
function createEvent() {
  modalMode.value = 1
  isVisible.value = true
}

/**
 * 開啟編輯活動彈窗，並將現有資料填入表單
 * @param currentData - 要編輯的活動資料
 */
function editEvent(currentData: EventData) {
  modalMode.value = 2
  currentEventId.value = currentData.id
  currentEventName.value = currentData.name
  currentStartDate.value = currentData.startDate
  currentEndDate.value = currentData.endDate
  currentIsHidden.value = currentData.isHidden
  isVisible.value = true
}

/**
 * 開啟刪除活動確認彈窗
 * @param currentData - 要刪除的活動資料
 */
function deleteEvent(currentData: EventData) {
  modalMode.value = 3
  currentEventId.value = currentData.id
  currentEventName.value = currentData.name
  isVisible.value = true
}

/**
 * 執行新增、修改或刪除 API，成功後關閉彈窗並通知父層
 */
async function confirm() {
  /** 新增或修改時的請求 body */
  const eventData = {
    name: currentEventName.value,
    startDate: currentStartDate.value,
    endDate: currentEndDate.value,
    isHidden: currentIsHidden.value,
  }
  if (modalMode.value === 1) await eventApi.postEvents(eventData)
  if (modalMode.value === 2) await eventApi.patchEvents(eventData, { id: currentEventId.value })
  if (modalMode.value === 3) await eventApi.deleteEvents({ id: currentEventId.value })
  closeModal()
  emit('confirmed')
}

/**
 * 關閉彈窗並重置所有表單欄位
 */
function closeModal() {
  currentEventId.value = 0
  currentEventName.value = ''
  currentStartDate.value = ''
  currentEndDate.value = ''
  currentIsHidden.value = false
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
    width="500px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div class="row">
        <text-input label="活動名稱" v-model:value="currentEventName"></text-input>
        <text-input label="是否顯示" v-model:value="currentIsHidden"></text-input>
      </div>
      <div class="row">
        <text-input label="開始日期" v-model:value="currentStartDate"></text-input>
        <text-input label="結束日期" v-model:value="currentEndDate"></text-input>
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.row {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
