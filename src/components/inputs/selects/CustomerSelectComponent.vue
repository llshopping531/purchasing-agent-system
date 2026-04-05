<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { customersApi } from '@/services/api/customers/customers-api'

defineProps<{
  defaultValue?: Option
}>()

const emit = defineEmits<{
  (e: 'selectOption', data: Option): void
}>()

const customerList = ref<Option[]>([])

onMounted(() => {
  getCustomerList()
})

async function getCustomerList() {
  const res = await customersApi.getCustomersAll()
  customerList.value = res.map((c) => ({
    name: c.name,
    value: c.id.toString(),
  }))
}
</script>

<template>
  <select-component
    label="客戶"
    :optionList="customerList"
    :defaultValue="defaultValue"
    @selectOption="emit('selectOption', $event)"
  />
</template>
