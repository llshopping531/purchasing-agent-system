<script setup lang="ts">
/**
 * 自訂樣式的核取方塊輸入元件
 * 隱藏原生 checkbox，以自訂 SVG 圖示取代視覺呈現
 */
defineProps<{
  /** 核取方塊旁的標籤文字 */
  label: string
}>()

/** 核取狀態，透過 v-model 雙向綁定 */
const checked = defineModel<boolean>({ default: false })
</script>

<template>
  <label class="checkboxInput">
    <input type="checkbox" v-model="checked" />
    <img v-if="checked" alt="isChecked" class="icon" src="@/assets/checked.svg" />
    <img v-if="!checked" alt="isChecked" class="icon" src="@/assets/unChecked.svg" />
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
