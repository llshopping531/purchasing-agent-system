<script setup lang="ts">
/**
 * 出貨單狀態下拉選取元件
 */
import type { SelectOption } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import type { ShippingOrderStatus } from '@/stores/shippingOrder'

const props = withDefaults(
  defineProps<{
    defaultValue: ShippingOrderStatus | undefined
    required?: boolean
    isDisplayLable?: boolean
  }>(),
  { isDisplayLable: true },
)

const emit = defineEmits<{
  (e: 'selectOption', data: SelectOption<ShippingOrderStatus>): void
}>()

const options: SelectOption<ShippingOrderStatus>[] = [
  { value: '未出貨', name: '未出貨', color: '#94a3b8' },
  { value: '出貨中', name: '出貨中', color: '#a16207' },
  { value: '已出貨', name: '已出貨', color: '#16a34a' },
]

function getOption(val: ShippingOrderStatus | undefined) {
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
