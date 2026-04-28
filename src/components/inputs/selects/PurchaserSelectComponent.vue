<script setup lang="ts">
/**
 * 採購者下拉選取元件（固定清單：莉莉、嵐嵐、小幫手）
 */
import { ref, computed, watch } from 'vue'
import type { SelectOption } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'

const props = withDefaults(
  defineProps<{
    /** 是否顯示「全部」選項 */
    isDisplayAll?: boolean
    /** 預設選取的採購者名稱 */
    defaultValue?: string
    isDisplayLabel?: boolean
  }>(),
  {
    isDisplayLabel: true,
  },
)

const emit = defineEmits<{
  (e: 'selectOption', data: SelectOption<string | undefined>): void
}>()

const PURCHASERS: SelectOption<string>[] = [
  { name: '莉莉', value: '1' },
  { name: '嵐嵐', value: '2' },
  { name: '小幫手', value: '3' },
]

const allOption: SelectOption<undefined> = { value: undefined, name: '全部' }
const options = computed<SelectOption<string | undefined>[]>(() =>
  props.isDisplayAll
    ? [allOption, ...PURCHASERS]
    : [...PURCHASERS, { name: '無', value: undefined }],
)

const localDefault = ref<SelectOption<string | undefined> | undefined>(
  PURCHASERS.find((o) => o.value === props.defaultValue),
)

watch(
  () => props.defaultValue,
  (val) => {
    localDefault.value = PURCHASERS.find((o) => o.value === val)
  },
)

function selectOption(opt: SelectOption<string | undefined>) {
  localDefault.value = opt
  emit('selectOption', opt)
}
</script>

<template>
  <select-component
    label="採購者"
    :isDisplayLable="isDisplayLabel"
    :optionList="options"
    :defaultValue="localDefault"
    @selectOption="selectOption($event)"
  />
</template>
