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
const isShowConfirmMadol = ref<boolean>(false)

function cancel() {
  emit('cancel')
}
function confirm() {
  emit('confirm')
}
</script>

<template>
  <ModalComponent
    v-if="!isDelete"
    :name="name"
    width="500px"
    @confirm="isShowConfirmMadol = true"
    @cancel="cancel"
    :isShowCancelBtn="true"
  >
    <template #content>
      <slot name="content"></slot>
    </template>
  </ModalComponent>
  <ModalComponent
    :name="'提示'"
    :isShowCancelBtn="true"
    width="350px"
    v-if="isShowConfirmMadol || isDelete"
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
  </ModalComponent>
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
