<script setup lang="ts">
/**
 * 基礎彈窗元件
 * 掛載時鎖定 body 捲動，卸載時解除，提供標題、內容 slot 與確定／取消按鈕
 */
import { onMounted, onUnmounted } from 'vue'
import MaskComponent from './MaskComponent.vue'

defineProps<{
  /** 彈窗標題 */
  name: string
  /** 彈窗寬度（CSS 值） */
  width?: string
  /** 是否顯示取消按鈕 */
  isShowCancelBtn?: boolean
}>()

const emit = defineEmits<{
  /** 點擊確定時觸發 */
  (e: 'confirm'): void
  /** 點擊取消或遮罩時觸發 */
  (e: 'cancel'): void
}>()

onMounted(() => {
  document.body.classList.add('no-scroll')
})

onUnmounted(() => {
  document.body.classList.remove('no-scroll')
})

/** 觸發確定事件 */
function confirm() {
  emit('confirm')
}

/** 觸發取消事件 */
function cancel() {
  emit('cancel')
}
</script>
<template>
  <mask-component @click="cancel"></mask-component>
  <div class="modal" :style="{ width: width }">
    <div class="modal-title">{{ name }}</div>
    <div class="modal-body">
      <slot name="content"></slot>
    </div>
    <div class="btnBox">
      <div class="btn" @click="confirm">確定</div>
      <div class="btn btn-outline" @click="cancel" v-if="isShowCancelBtn">取消</div>
    </div>
  </div>
</template>
<style>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  width: 700px;
  max-width: 92vw;
  max-height: 88vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 201;

  .modal-title {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: #fff;
    padding: 0.875rem 1.5rem;
    font-size: 1.05rem;
    font-weight: 600;
    text-align: center;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 3rem 2rem;

    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--color-primary-light);
      border-radius: 3px;
      opacity: 0.6;
    }
  }

  .btnBox {
    padding: 0.875rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    border-top: 1px solid var(--color-border);
    flex-shrink: 0;
    background: #faf9ff;
  }
}
</style>
