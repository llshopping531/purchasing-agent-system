<script setup lang="ts">
defineProps<{
  label: string
}>()

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
  margin-top: 1rem;
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
