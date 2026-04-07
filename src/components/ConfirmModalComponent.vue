<script setup lang="ts">
import ModalComponent from '@/components/ModalComponent.vue'
import { ref } from 'vue'
const props = withDefaults(
  defineProps<{
    name: string
    confirmText: string
    isDelete?: boolean
    width?: string
    /** 點擊確定前執行的驗證函式，回傳 false 時阻止進入確認彈窗 */
    beforeConfirm?: () => boolean | Promise<boolean>
  }>(),
  {
    isDelete: false,
    width: '500px',
  }
)
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
async function handleFirstConfirm() {
  if (props.beforeConfirm) {
    const valid = await props.beforeConfirm()
    if (!valid) return
  }
  isShowConfirmModal.value = true
}
</script>

<template>
  <modal-component
    v-if="!isDelete"
    :name="name"
    width="500px"
    @confirm="handleFirstConfirm"
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
        <p>{{ confirmText }}</p>
        <span>！提醒：此操作可能無法復原</span>
      </div>
    </template>
  </modal-component>
</template>

<style>
.remind {
  text-align: center;
  padding: 1.5rem 0.5rem 0.5rem;

  p {
    font-size: 1rem;
    color: #333;
    margin-bottom: 0.75rem;
    line-height: 1.7;
    font-weight: 400;
  }

  span {
    font-size: 0.8rem;
    color: var(--color-danger);
    font-weight: 500;
  }
}
</style>
