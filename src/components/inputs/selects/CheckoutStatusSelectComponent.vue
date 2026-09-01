<script setup lang="ts">
/**
 * 結帳單狀態下拉選取元件
 */
import type { SelectOption } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import type { CheckoutBillStatus } from '@/stores/checkout'

const props = withDefaults(
  defineProps<{
    defaultValue: CheckoutBillStatus | undefined
    required?: boolean
    isDisplayLable?: boolean
  }>(),
  { isDisplayLable: true },
)

const emit = defineEmits<{
  (e: 'selectOption', data: SelectOption<CheckoutBillStatus>): void
}>()

const options: SelectOption<CheckoutBillStatus>[] = [
  { value: '未收款', name: '未收款', color: '#94a3b8' },
  { value: '收款中', name: '收款中', color: '#a16207' },
  { value: '已收款', name: '已收款', color: '#16a34a' },
]

function getOption(val: CheckoutBillStatus | undefined) {
  return options.find((o) => o.value === val)
}
</script>

<template>
  <select-component
    label="狀態"
    :isDisplayLable="isDisplayLable"
    :optionList="options"
    :defaultValue="getOption(defaultValue)"
    :required="required"
    @selectOption="emit('selectOption', $event)"
  />
</template>
