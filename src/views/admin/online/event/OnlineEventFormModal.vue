<script setup lang="ts">
/**
 * 通販活動新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createEvent / editEvent / deleteEvent 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入活動列表
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import { onlineEventApi } from '@/services/api/online/online-events/online-events-api'
import type { QueryOnlineEventsContent } from '@/services/api/online/online-events/online-events-api-interfaces'

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

const isVisible = ref(false)
/** 操作模式：1 = 新增，2 = 修改，3 = 刪除 */
const modalMode = ref<1 | 2 | 3>(1)
const currentEventId = ref(0)

const schema = yup.object({
  name: yup.string().required('活動名稱為必填'),
  startDate: yup.string().required('開團日期為必填'),
  deliveryDate: yup.string().optional(),
  progress: yup.string().optional(),
  note: yup.string().optional(),
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: '', startDate: '', deliveryDate: '', progress: '', note: '' },
})

const [currentName] = defineField('name')
const [currentStartDate] = defineField('startDate')
const [currentDeliveryDate] = defineField('deliveryDate')
const [currentProgress] = defineField('progress')
const [currentNote] = defineField('note')
const currentIsLocked = ref(false)

function createEvent() {
  modalMode.value = 1
  resetForm()
  currentIsLocked.value = false
  isVisible.value = true
}

function editEvent(data: QueryOnlineEventsContent) {
  modalMode.value = 2
  currentEventId.value = data.id
  resetForm({
    values: {
      name: data.name,
      startDate: data.startDate,
      deliveryDate: data.deliveryDate ?? '',
      progress: data.progress ?? '',
      note: data.note ?? '',
    },
  })
  currentIsLocked.value = data.isLocked
  isVisible.value = true
}

function deleteEvent(data: QueryOnlineEventsContent) {
  modalMode.value = 3
  currentEventId.value = data.id
  resetForm({ values: { name: data.name, startDate: '', deliveryDate: '', progress: '', note: '' } })
  isVisible.value = true
}

async function beforeConfirm(): Promise<boolean> {
  if (modalMode.value === 3) return true
  const { valid } = await validate()
  return valid
}

async function confirm() {
  const payload = {
    name: currentName.value ?? '',
    startDate: currentStartDate.value ?? '',
    deliveryDate: currentDeliveryDate.value || undefined,
    progress: currentProgress.value || undefined,
    note: currentNote.value || undefined,
    isLocked: currentIsLocked.value,
  }
  if (modalMode.value === 1) await onlineEventApi.postOnlineEvents(payload)
  if (modalMode.value === 2) await onlineEventApi.patchOnlineEvents(currentEventId.value, payload)
  if (modalMode.value === 3) await onlineEventApi.deleteOnlineEvents(currentEventId.value)
  closeModal()
  emit('confirmed')
}

function closeModal() {
  currentEventId.value = 0
  currentIsLocked.value = false
  resetForm()
  isVisible.value = false
}

defineExpose({ createEvent, editEvent, deleteEvent })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增通販活動' : modalMode === 2 ? '編輯通販活動' : '刪除通販活動'"
    :confirmText="
      modalMode === 3
        ? `您確定要刪除「${currentName}」嗎？`
        : modalMode === 1
          ? '您確定要新增此通販活動嗎？'
          : '您確定要編輯此通販活動嗎？'
    "
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="500px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode !== 3" class="formGrid">
        <div class="formItem">
          <text-input label="活動名稱" v-model:value="currentName" required :error-message="errors.name" />
        </div>
        <div class="formItem">
          <text-input label="開團日期" v-model:value="currentStartDate" required :error-message="errors.startDate" />
        </div>
        <div class="formItem">
          <text-input label="官方出貨日期" v-model:value="currentDeliveryDate" />
        </div>
        <div class="formItem">
          <text-input label="進度" v-model:value="currentProgress" />
        </div>
        <div class="formItem full">
          <text-input label="備註" v-model:value="currentNote" />
        </div>
        <div class="formItem-checkbox">
          <checkbox-input label="是否鎖定" v-model="currentIsLocked" style="margin-top: auto" />
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
  .formItem-checkbox {
    display: flex;
    gap: 1rem;
  }
  @media (max-width: 768px) {
    gap: 0.25rem;
    .formItem,
    .formItem.full {
      width: 100%;
    }
    .formItem-checkbox {
      width: 100%;
    }
  }
}
</style>
