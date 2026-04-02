<script setup lang="ts">
import ModalComponent from '@/components/ModalComponent.vue'
import { ref } from 'vue'
defineProps<{
  name: string
  confromText: string
  isDelete: boolean
  width?: string
  isShowCancelBtn?: boolean
}>()
const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
const isShowConfirmModal = ref<boolean>(false)

function cancel() {
  emit('cancel')
}
function confirm() {
  emit('confirm')
}
</script>

<template>
  <modal-component
    v-if="!isDelete"
    :name="name"
    width="500px"
    @confirm="isShowConfirmModal = true"
    @cancel="cancel"
    :isShowCancelBtn="true"
  >
    <template #content>
      <slot name="content"></slot>
    </template>
  </modal-component>
  <modal-component
    :name="'提示'"
    :isShowCancelBtn="true"
    width="350px"
    v-if="isShowConfirmModal || isDelete"
    @confirm="confirm"
    @cancel="cancel"
  >
    <template #content>
      <div class="remind">
        <p>
          {{ confromText }}
        </p>
        <span>！提醒: 此操作可能無法復原</span>
      </div>
    </template>
  </modal-component>
</template>

<style>
.remind {
  margin-top: 3rem;
  text-align: center;
  span {
    font-size: 12px;
    color: #f53f3f;
  }
}
</style>
