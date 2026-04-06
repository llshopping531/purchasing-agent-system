<script setup lang="ts">

defineProps<{
  label: string
  placeholder?: string
  disabled?: boolean
}>()
const value = defineModel('value')

</script>

<template>
  <label class="label">
    <span>{{ label }}</span>
    <input type="text" :placeholder="placeholder" v-model="value" :disabled="disabled" />
  </label>
</template>

<style scoped>
.label {
  margin-top: 1rem;
  display: block;
  span {
    font-weight: bold;
    font-size: 1rem;
  }
  input {
    display: block;
    margin-top: 0.25rem;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    border: 1px solid var(--color-primary);
    &:focus-visible {
      outline-color: var(--color-primary);
    }
    &:disabled {
      background-color: #f5f5f5;
      color: #aaa;
      cursor: not-allowed;
    }
  }
}
</style>
