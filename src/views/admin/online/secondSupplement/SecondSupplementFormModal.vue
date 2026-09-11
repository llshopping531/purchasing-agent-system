<script setup lang="ts">
/**
 * 新增集運出貨單彈窗
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import type { SelectOption } from '@/interfaces/common'
import { useMenuStore } from '@/stores/menu'
import type { QueryOnlineEventsContent } from '@/services/api/online/online-events/online-events-api-interfaces'

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

const menuStore = useMenuStore()

const isVisible = ref(false)
const isEditMode = ref(false)
const currentId = ref<number | null>(null)

const eventOptions = ref<SelectOption<QueryOnlineEventsContent>[]>([])
const selectedEvents = ref<SelectOption<QueryOnlineEventsContent>[]>([])
const eventError = ref('')

const numField = yup
  .number()
  .transform((v, o) => (o === '' ? null : v))
  .typeError('請輸入數字')
  .min(0, '請輸入正數')
  .required('此欄位為必填')

const schema = yup.object({
  name: yup.string().required('名稱為必填'),
  internationalShippingTotal: numField,
  totalWeightG: numField,
  pricePerKg: numField,
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: {
    name: '',
    internationalShippingTotal: null as number | null,
    totalWeightG: null as number | null,
    pricePerKg: 150 as number | null,
  },
})

const [name] = defineField('name')
const [internationalShippingTotal] = defineField('internationalShippingTotal')
const [totalWeightG] = defineField('totalWeightG')
const [pricePerKg] = defineField('pricePerKg')

async function open() {
  const events = await menuStore.fetchOnlineEventsAll()
  eventOptions.value = events.map((e) => ({ name: e.name, value: e }))
  selectedEvents.value = []
  isEditMode.value = false
  currentId.value = null
  resetForm()
  isVisible.value = true
}

async function edit(data: { id: number; name: string; events: string[]; internationalShippingTotal: number; totalWeightG: number; pricePerKg: number }) {
  const events = await menuStore.fetchOnlineEventsAll()
  eventOptions.value = events.map((e) => ({ name: e.name, value: e }))
  selectedEvents.value = eventOptions.value.filter((o) => data.events.includes(o.name))
  isEditMode.value = true
  currentId.value = data.id
  resetForm({
    values: {
      name: data.name,
      internationalShippingTotal: data.internationalShippingTotal,
      totalWeightG: data.totalWeightG,
      pricePerKg: data.pricePerKg,
    },
  })
  isVisible.value = true
}

async function beforeConfirm(): Promise<boolean> {
  const { valid } = await validate()
  if (selectedEvents.value.length === 0) {
    eventError.value = '請至少選擇一個活動'
    return false
  }
  eventError.value = ''
  return valid
}

async function confirm() {
  // TODO: 呼叫 API
  closeModal()
  emit('confirmed')
}

function closeModal() {
  resetForm()
  selectedEvents.value = []
  eventError.value = ''
  isVisible.value = false
}

defineExpose({ open, edit })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="isEditMode ? '編輯集運出貨單' : '新增集運出貨單'"
    confirmText="確認"
    :beforeConfirm="beforeConfirm"
    width="520px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div class="formGrid">
        <div class="formItem full">
          <text-input label="名稱" v-model:value="name" required :error-message="errors.name" />
        </div>
        <div class="formItem full">
          <select-component
            label="加入活動"
            :optionList="eventOptions"
            :defaultValue="undefined"
            :multiple="true"
            :selectedValues="selectedEvents"
            @selectOptions="selectedEvents = $event; eventError = ''"
          />
          <div v-if="eventError" class="field-error">{{ eventError }}</div>
        </div>
        <div class="formItem">
          <text-input
            label="國境運費總額"
            v-model:value="internationalShippingTotal"
            required
            :error-message="errors.internationalShippingTotal"
          />
        </div>
        <div class="formItem">
          <text-input
            label="總重量（g）"
            v-model:value="totalWeightG"
            required
            :error-message="errors.totalWeightG"
          />
        </div>
        <div class="formItem">
          <text-input
            label="每公斤金額（/kg）"
            v-model:value="pricePerKg"
            required
            :error-message="errors.pricePerKg"
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

.field-error {
  margin-top: 0.3rem;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
}
</style>
