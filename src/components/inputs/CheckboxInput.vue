<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  /** 多選模式時使用，代表此 checkbox 的值 */
  value?: string
}>()

const model = defineModel<boolean | string[]>({ default: false })

// 自動判斷勾選狀態
const isChecked = computed(() => {
  if (Array.isArray(model.value)) {
    return model.value.includes(props.value ?? '')
  }
  return model.value
})

const handleChange = (e: Event) => {
  const checked = (e.target as HTMLInputElement).checked

  if (Array.isArray(model.value)) {
    const newVal = [...model.value]
    if (checked) {
      newVal.push(props.value ?? '')
    } else {
      newVal.splice(newVal.indexOf(props.value ?? ''), 1)
    }
    model.value = newVal
  } else {
    model.value = checked
  }
}
</script>

<template>
  <label class="checkboxInput">
    <input type="checkbox" :checked="isChecked" @change="handleChange" />
    <img v-if="isChecked" alt="isChecked" class="icon" src="@/assets/checked.svg" />
    <img v-if="!isChecked" alt="isChecked" class="icon" src="@/assets/unChecked.svg" />
    <span>{{ label }}</span>
  </label>
</template>

<style scoped>
.checkboxInput {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  .icon {
    display: inline-block;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
  }
  input[type='checkbox'] {
    display: none;
  }
}
</style>
