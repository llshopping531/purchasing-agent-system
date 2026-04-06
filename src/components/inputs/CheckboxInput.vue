<script setup lang="ts">
defineProps<{
  label: string
}>()

const checked = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="checkboxInput">
    <input type="checkbox" v-model="checked" />
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
  margin-top: 1rem;
  user-select: none;
  input[type='checkbox'] {
    width: 15px;
    height: 15px;
    accent-color: #8cbfa4;
    cursor: pointer;
    flex-shrink: 0;
  }
}
</style>
