<script setup lang="ts">
defineProps<{
  value: boolean
}>()
</script>

<template>
  <span class="bool">
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

  .icon {
    display: inline-block;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    flex-shrink: 0;
    position: relative;
  }
}
</style>
