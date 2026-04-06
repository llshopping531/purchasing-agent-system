<script setup lang="ts">
import { ref } from 'vue'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import NewCustomerForm from '@/components/forms/NewCustomerForm.vue'
import { customersApi } from '@/services/api/customers/customers-api'
import type { CustomersResBase } from '@/services/api/customers/customers-api-interfaces'

const emit = defineEmits<{ (e: 'confirmed'): void }>()

const isVisible = ref(false)
// 1新增 2修改
const modalMode = ref<1 | 2>(1)
const currentId = ref(0)

const name = ref('')
const source = ref('')
const hasMessagedOfficial = ref(false)
const isDiscount = ref(false)
const isBoss = ref(false)
const note = ref('')

function createCustomer() {
  modalMode.value = 1
  isVisible.value = true
}

function editCustomer(data: CustomersResBase) {
  modalMode.value = 2
  currentId.value = data.id
  name.value = data.name
  source.value = data.source
  hasMessagedOfficial.value = data.hasMessagedOfficial
  isDiscount.value = data.isDiscount
  isBoss.value = data.isBoss
  note.value = data.note
  isVisible.value = true
}

async function confirm() {
  const req = {
    name: name.value,
    source: source.value,
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

function closeModal() {
  currentId.value = 0
  name.value = ''
  source.value = ''
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
    :confromText="modalMode === 1 ? '您確定要新增此顧客嗎？' : '您確定要修改此顧客嗎？'"
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
        />
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1.5rem;
  padding: 0 0.5rem;
}
</style>
