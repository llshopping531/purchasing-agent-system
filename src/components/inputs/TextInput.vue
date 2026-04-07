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
  /** 是否為必填欄位（顯示紅色星號） */
  required?: boolean
  /** 驗證錯誤訊息 */
  errorMessage?: string
}>()

const value = defineModel('value')
</script>

<template>
  <label class="label">
    <span class="title">{{ label }}<span v-if="required" class="required-mark">*</span></span>
    <input
      type="text"
      :placeholder="placeholder"
      v-model="value"
      :disabled="disabled"
      :class="{ 'input-error': errorMessage }"
    />
    <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
  </label>
</template>

<style scoped>
.label {
  display: block;

  .title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    display: flex;
    gap: 0.25rem;
    margin-bottom: 0.25rem;
    .required-mark {
      display: inline;
      color: var(--color-danger, #e53e3e);
      margin-left: 0.2rem;
      font-weight: 700;
    }
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

    &.input-error {
      border-color: var(--color-danger, #e53e3e);
      box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
    }
  }
}

.error-message {
  display: block;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
  margin-top: 0.25rem;
  font-weight: 500;
}
</style>
