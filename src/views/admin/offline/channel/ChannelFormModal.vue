<script setup lang="ts">
/**
 * 通路新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createChannel / editChannel / deleteChannel 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入通路列表
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import { channelApi, type ChannelContent } from '@/services/api/channels/channels-api'

const props = defineProps<{
  /** 目前選取的活動 ID */
  eventId: string
}>()

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

const isVisible = ref(false)
/** 操作模式：1 = 新增，2 = 修改，3 = 刪除 */
const modalMode = ref<1 | 2 | 3>(1)
const currentId = ref(0)
const currentName = ref('')

const schema = yup.object({
  name: yup.string().required('通路名稱為必填'),
  exchangeRate: yup.number().transform((v, o) => (o === '' ? null : v)).typeError('請輸入數字').positive('請輸入正數').required('匯率為必填'),
  thresholdJpy: yup.number().transform((v, o) => (o === '' ? null : v)).typeError('請輸入數字').min(0, '請輸入非負數').required('日幣滿額門檻為必填'),
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: '', exchangeRate: null as number | null, thresholdJpy: null as number | null },
})

const [name] = defineField('name')
const [exchangeRate] = defineField('exchangeRate')
const [thresholdJpy] = defineField('thresholdJpy')

function createChannel() {
  modalMode.value = 1
  resetForm({ values: { name: '', exchangeRate: null, thresholdJpy: null } })
  isVisible.value = true
}

function editChannel(data: ChannelContent) {
  modalMode.value = 2
  currentId.value = data.id
  resetForm({
    values: {
      name: data.name,
      exchangeRate: data.exchangeRate,
      thresholdJpy: data.thresholdJpy,
    },
  })
  isVisible.value = true
}

function deleteChannel(data: ChannelContent) {
  modalMode.value = 3
  currentId.value = data.id
  currentName.value = data.name
  isVisible.value = true
}

async function beforeConfirm(): Promise<boolean> {
  if (modalMode.value === 3) return true
  const { valid } = await validate()
  return valid
}

async function confirm() {
  if (modalMode.value === 1 || modalMode.value === 2) {
    const req = {
      eventId: Number(props.eventId),
      name: name.value ?? '',
      exchangeRate: exchangeRate.value ?? undefined,
      thresholdJpy: thresholdJpy.value ?? undefined,
    }
    if (modalMode.value === 1) await channelApi.postChannels(req)
    if (modalMode.value === 2) await channelApi.patchChannels(currentId.value, req)
  }
  if (modalMode.value === 3) await channelApi.deleteChannels(currentId.value)
  closeModal()
  emit('confirmed')
}

function closeModal() {
  currentId.value = 0
  currentName.value = ''
  resetForm({ values: { name: '', exchangeRate: null, thresholdJpy: null } })
  isVisible.value = false
}

defineExpose({ createChannel, editChannel, deleteChannel })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增通路' : '編輯通路'"
    :confirmText="
      modalMode === 3
        ? `您確定要刪除「${currentName}」嗎？`
        : modalMode === 1
          ? '您確定要新增此通路嗎？'
          : '您確定要修改此通路嗎？'
    "
    :isDelete="modalMode === 3"
    :beforeConfirm="beforeConfirm"
    width="500px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode !== 3" class="formGrid">
        <text-input
          label="通路名稱"
          v-model:value="name"
          required
          :error-message="errors.name"
        />
        <text-input
          label="匯率"
          v-model:value="exchangeRate"
          required
          :error-message="errors.exchangeRate"
        />
        <div>
          <text-input
            label="日幣滿額門檻"
            v-model:value="thresholdJpy"
            required
            :error-message="errors.thresholdJpy"
          />
          <span class="hint">若無滿額禮則填入 0</span>
        </div>
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.hint {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

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
