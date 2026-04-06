<script setup lang="ts">
/**
 * 通用文字輸入元件
 * 透過 v-model:value 雙向綁定，支援 disabled 狀態
 */
defineProps<{
  /** 輸入框標籤文字 */
  label: string
  /** 輸入框佔位提示文字 */
  placeholder?: string
  /** 是否禁用輸入 */
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
  display: block;

  span {
    display: block;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.35rem;
  }

  input {
    display: block;
    padding: 0.5rem 0.875rem;
    font-size: 0.9rem;
    border-radius: var(--radius-md);
    border: 1.5px solid rgba(124, 111, 224, 0.3);
    background: var(--color-surface);
    transition:
      border-color 0.15s,
      box-shadow 0.15s;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(124, 111, 224, 0.1);
    }

    &:focus-visible {
      outline: none;
    }

    &:disabled {
      background: #f5f3ff;
      color: #aaa;
      cursor: not-allowed;
      border-color: rgba(124, 111, 224, 0.15);
    }
  }
}
</style>
