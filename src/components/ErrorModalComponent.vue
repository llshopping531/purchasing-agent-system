<script setup lang="ts">
import { useErrorStore } from '@/stores/error'
import ModalComponent from './ModalComponent.vue'

const errorStore = useErrorStore()
</script>

<template>
  <modal-component
    v-if="errorStore.isVisible"
    name="錯誤"
    width="400px"
    @confirm="errorStore.close"
    @cancel="errorStore.close"
  >
    <template #content>
      <p class="error-message">{{ errorStore.message }}</p>
    </template>
  </modal-component>
</template>

<style scoped>
.error-message {
  text-align: center;
  color: var(--color-danger, #e53e3e);
  font-size: 1rem;
  line-height: 1.6;
}
</style>
