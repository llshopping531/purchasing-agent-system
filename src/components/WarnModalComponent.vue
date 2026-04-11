<script setup lang="ts">
import { useWarnStore } from '@/stores/warn'
import ModalComponent from './ModalComponent.vue'

const warnStore = useWarnStore()
</script>

<template>
  <modal-component
    v-if="warnStore.isVisible"
    name="警告"
    width="400px"
    @confirm="warnStore.close"
    @cancel="warnStore.close"
  >
    <template #content>
      <p class="warn-message">{{ warnStore.message }}</p>
    </template>
  </modal-component>
</template>

<style scoped>
.warn-message {
  text-align: center;
  color: var(--color-warning, #d97706);
  font-size: 1rem;
  line-height: 1.6;
}
</style>
