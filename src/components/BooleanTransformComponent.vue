<script setup lang="ts">
/**
 * 布林值顯示元件
 * 將 true/false 轉換為「是／否」文字搭配對應圖示，並以色彩區分語意
 */
defineProps<{
  /** 要顯示的布林值 */
  value: boolean
}>()
</script>

<template>
  <span class="bool" :class="{ 'is-true': value, 'is-false': !value }">
    <img v-if="value" alt="isChecked" class="icon" src="@/assets/checked.svg" />
    <img v-if="!value" alt="isChecked" class="icon" src="@/assets/unChecked.svg" />
    {{ value ? '是' : '否' }}
  </span>
</template>

<style scoped>
.bool {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  font-weight: 500;

  &.is-true {
    color: var(--color-success);
  }

  &.is-false {
    color: var(--color-text-muted);
  }

  .icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
}
</style>
