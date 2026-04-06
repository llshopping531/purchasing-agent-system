<script setup lang="ts">
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import { eventApi, type EventData } from '@/services/api/event-api'
import { ref } from 'vue'

const emit = defineEmits<{ (e: 'confirmed'): void }>()

const isVisible = ref(false)
// 1新增 2修改 3刪除
const modalMode = ref<1 | 2 | 3>(1)
const currentEventId = ref(0)
const currentEventName = ref('')
const currentStartDate = ref('')
const currentEndDate = ref('')
const currentIsHidden = ref(false)

function createEvent() {
  modalMode.value = 1
  isVisible.value = true
}

function editEvent(currentData: EventData) {
  modalMode.value = 2
  currentEventId.value = currentData.id
  currentEventName.value = currentData.name
  currentStartDate.value = currentData.startDate
  currentEndDate.value = currentData.endDate
  currentIsHidden.value = currentData.isHidden
  isVisible.value = true
}

function deleteEvent(currentData: EventData) {
  modalMode.value = 3
  currentEventId.value = currentData.id
  currentEventName.value = currentData.name
  isVisible.value = true
}

async function confirm() {
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
