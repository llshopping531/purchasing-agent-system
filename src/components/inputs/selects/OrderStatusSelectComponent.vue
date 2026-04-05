<script setup lang="ts">
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'

defineProps<{
  defaultValue?: Option
}>()

const emit = defineEmits<{
  (e: 'selectOption', data: Option): void
}>()

const orderStatusOptions: Option[] = [
  { value: '1', name: '已喊單' },
  { value: '2', name: '已購買' },
  { value: '3', name: '已取消' },
]
</script>

<template>
  <select-component
    label="訂單狀態"
    :optionList="orderStatusOptions"
    :defaultValue="defaultValue"
    @selectOption="emit('selectOption', $event)"
  />
</template>
