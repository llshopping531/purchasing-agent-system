<script setup lang="ts">
/**
 * 商品匯入彈窗
 * 提供下載範本與上傳檔案匯入商品，匯入完成後顯示成功／失敗結果
 */
import { ref } from 'vue'
import ModalComponent from '@/components/ModalComponent.vue'
import { importApi, type ImportProductsRes } from '@/services/api/import/import-api'

const props = defineProps<{
  /** 目前選取的活動 ID */
  eventId: string
}>()

const emit = defineEmits<{
  /** 匯入成功後通知父層重新整理 */
  (e: 'confirmed'): void
  /** 關閉彈窗 */
  (e: 'close'): void
}>()

/** 上傳的檔案 */
const selectedFile = ref<File | null>(null)
/** 匯入結果（null 表示尚未匯入） */
const result = ref<ImportProductsRes | null>(null)
/** 隱藏的 file input ref */
const fileInputRef = ref<HTMLInputElement>()

/**
 * 下載商品匯入範本
 * 將回傳的字串陣列以換行符號合併後觸發瀏覽器下載
 */
async function downloadTemplate() {
  const rows = await importApi.getProductTemplate()
  const content = rows.join('\n')
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '商品匯入範本.csv'
  a.click()
  URL.revokeObjectURL(url)
}

/** 觸發 file input 點擊 */
function triggerFileInput() {
  fileInputRef.value?.click()
}

/** 使用者選取檔案後記錄，並清除上次結果 */
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  result.value = null
}

/** 送出匯入，顯示結果 */
async function doImport() {
  if (!selectedFile.value) return
  result.value = await importApi.importProducts(Number(props.eventId), selectedFile.value)
  if (result.value.successCount > 0) emit('confirmed')
}

function close() {
  emit('close')
}
</script>

<template>
  <modal-component name="商品匯入" :isShowCancelBtn="true" @confirm="close" @cancel="close">
    <template #content>
      <div class="import-body">
        <!-- 下載範本 -->
        <div class="section">
          <p class="section-label">步驟 1：下載匯入範本</p>
          <div class="btn btn-outline-primary" @click="downloadTemplate">下載範本</div>
        </div>

        <!-- 選擇檔案 -->
        <div class="section">
          <p class="section-label">步驟 2：選擇檔案並匯入</p>
          <div class="file-row">
            <input
              ref="fileInputRef"
              type="file"
              accept=".csv,.xlsx,.xls"
              class="hidden-input"
              @change="onFileChange"
            />
            <div class="file-pick-btn btn btn-outline-primary" @click="triggerFileInput">
              選擇檔案
            </div>
            <span class="file-name">{{ selectedFile ? selectedFile.name : '尚未選擇檔案' }}</span>
          </div>
          <div class="btn" :class="{ disabled: !selectedFile }" @click="doImport">開始匯入</div>
        </div>

        <!-- 匯入結果 -->
        <div class="section result-section" v-if="result">
          <p class="section-label">匯入結果</p>
          <div class="result-summary">
            <span class="success-count">成功 {{ result.successCount }} 筆</span>
            <span class="divider">｜</span>
            <span class="failure-count" :class="{ hasError: result.failureCount > 0 }">
              失敗 {{ result.failureCount }} 筆
            </span>
          </div>
          <div v-if="result.errors.length > 0" class="error-list">
            <p class="error-title">錯誤明細：</p>
            <ul>
              <li v-for="(err, i) in result.errors" :key="i" class="error-item">{{ err }}</li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </modal-component>
</template>

<style scoped>
.import-body {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.section-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.hidden-input {
  display: none;
}

.file-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.file-name {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.btn-outline-primary {
  background: transparent;
  border: 1.5px solid var(--color-primary);
  color: var(--color-primary);
  box-shadow: none;

  &:hover {
    background: var(--color-primary-muted);
  }
}

.btn.disabled {
  opacity: 0.45;
  pointer-events: none;
}

.result-section {
  background: var(--color-background-soft, #f8f6ff);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
}

.result-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;

  .divider {
    color: var(--color-border);
  }

  .success-count {
    color: var(--color-success, #16a34a);
  }

  .failure-count {
    color: var(--color-text-secondary);

    &.hasError {
      color: var(--color-danger);
    }
  }
}

.error-list {
  margin-top: 0.75rem;

  .error-title {
    font-size: 0.85rem;
    font-weight: 600;
    margin: 0 0 0.35rem;
    color: var(--color-danger);
  }

  ul {
    padding-left: 1.25rem;
    margin: 0;
  }

  .error-item {
    font-size: 0.85rem;
    color: var(--color-danger);
    margin-bottom: 0.2rem;
  }
}
</style>
