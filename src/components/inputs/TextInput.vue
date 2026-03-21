<script setup lang="ts">
defineProps<{
  label: string
  placeholder?: string
}>()
</script>

<template>
  <label class="label">
    <span>{{ label }}</span>
    <input type="text" :placeholder="placeholder" />
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
      border: 1px solid #00bd7e;
      &:focus-visible{
                        outline-color: #00bd7e;
      }
    }
  }
</style>
