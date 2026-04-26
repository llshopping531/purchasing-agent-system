<script setup lang="ts">
/**
 * 採購者下拉選取元件
 * 從 bossCustomersStore 取得採購者清單，無需額外呼叫 API
 */
import { ref, computed, onMounted } from 'vue'
import type { SelectOption } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { useBossCustomersStore } from '@/stores/bossCustomers'

const props = defineProps<{
  /** 是否顯示「全部」選項 */
  isDisplayAll?: boolean
}>()

const emit = defineEmits<{
  (e: 'selectOption', data: SelectOption<string | undefined>): void
}>()

const store = useBossCustomersStore()
const localDefault = ref<SelectOption<string | undefined> | undefined>(undefined)

onMounted(() => {
  store.ensure()
})

const allOption: SelectOption<undefined> = { value: undefined, name: '全部' }
const options = computed<SelectOption<string | undefined>[]>(() => {
  const list = store.options.map((o) => ({ name: o.name, value: o.value.name }))
  return props.isDisplayAll ? [allOption, ...list] : list
})

function selectOption(opt: SelectOption<string | undefined>) {
  localDefault.value = opt
  emit('selectOption', opt)
}
</script>

<template>
  <select-component
    label="採購者"
    :optionList="options"
    :defaultValue="localDefault"
    @selectOption="selectOption($event)"
  />
</template>
