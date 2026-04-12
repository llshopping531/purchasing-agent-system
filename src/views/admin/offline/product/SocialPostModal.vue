<script setup lang="ts">
/**
 * 社群貼文產生器彈窗
 * 提供可自訂模板語法，將活動名稱、通路名稱、商品列表自動填入，
 * 含商品行的模板列會依全部商品逐筆展開輸出，最後一鍵複製
 */
import { ref, onMounted, onUnmounted } from 'vue'
import MaskComponent from '@/components/MaskComponent.vue'
import { productsApi } from '@/services/api/products/products-api'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'
import { useModalLayer } from '@/composables/useModalLayer'

const props = defineProps<{
  eventId: string
  eventName: string
  shopId: string
  channelName: string
  minJpy: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// ── Modal 層級 ──────────────────────────────────────────────
const { acquire, release } = useModalLayer()
const maskZ = ref(200)
const modalZ = ref(201)
onMounted(async () => {
  const z = acquire()
  maskZ.value = z.maskZ
  modalZ.value = z.modalZ
  await fetchAllProducts()
})
onUnmounted(() => release())

// ── 商品資料 ───────────────────────────────────────────────
const allProducts = ref<ProductsResBase[]>([])
const isLoading = ref(false)

async function fetchAllProducts() {
  isLoading.value = true
  allProducts.value = await productsApi.getProductsAll({
    eventId: Number(props.eventId),
    channelId: Number(props.shopId),
  })
  isLoading.value = false
  render()
}

// ── 模板 ───────────────────────────────────────────────────
const defaultTemplate = `#場販 #\${EventName} \${channelName}
4/22-4/28連線

(emoji)商品(emoji)
\${productName} \${productPrice}

(pizza)記事本喊單，商品若有限購按照喊單順序(pizza)

單次喊單滿日幣\${minJpy}可獲得隨機特典一枚
(emoji) 發完為止，若數量不足以消費金額較高者優先

∞----------------------------𓏲𓎨ෆ -
(emoji) 喊單前請先私訊官方帳號回報社群名稱
✿ 依照留言順序，確認購買會按貼圖
✿ 盲抽可代拆，留言時請備註代拆，且默認廠損
✿ 結單後不接受取消，喊單前請慎重考慮
✿ 依現場貨量為主，有可能缺貨，無缺A pass B
✿ 若有任何問題歡迎私訊官方
`


const template = ref(defaultTemplate)
const textareaRef = ref<HTMLTextAreaElement>()

/** 可用參數清單 */
const params = [
  { label: '活動名稱', token: '${EventName}', desc: '全域' },
  { label: '通路名稱', token: '${channelName}', desc: '全域' },
  { label: '日幣門檻', token: '${minJpy}', desc: '全域' },
  { label: '商品名稱', token: '${productName}', desc: '逐行' },
  { label: '台幣售價', token: '${productPrice}', desc: '逐行' },
  { label: '日幣售價', token: '${productPriceJpy}', desc: '逐行' },
  { label: '盲抽標記', token: '${isBlindBox}', desc: '逐行' },
]

/** 將參數插入到游標位置 */
function insertToken(token: string) {
  const el = textareaRef.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  template.value = template.value.slice(0, start) + token + template.value.slice(end)
  // 恢復游標位置
  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + token.length, start + token.length)
  })
}

/** 判斷某行是否含有商品展開 token */
function isProductLine(line: string): boolean {
  return (
    line.includes('${productName}') ||
    line.includes('${productPrice}') ||
    line.includes('${productPriceJpy}') ||
    line.includes('${isBlindBox}')
  )
}

function renderProduct(line: string, product: ProductsResBase): string {
  return line
    .replace(/\$\{productName\}/g, product.name)
    .replace(/\$\{productPrice\}/g, product.priceTwd ? `$${product.priceTwd.toLocaleString()}` : '—')
    .replace(/\$\{productPriceJpy\}/g, product.priceJpy ? `¥${product.priceJpy.toLocaleString()}` : '—')
    .replace(/\$\{isBlindBox\}/g, product.isBlindBox ? '【盲抽】' : '')
}

function renderGlobal(line: string): string {
  return line
    .replace(/\$\{EventName\}/g, props.eventName)
    .replace(/\$\{channelName\}/g, props.channelName)
    .replace(/\$\{minJpy\}/g, props.minJpy)
}

/** 渲染後可供編輯的輸出內容 */
const output = ref('')

function render() {
  const lines = template.value.split('\n')
  const result: string[] = []

  for (const line of lines) {
    if (isProductLine(line)) {
      if (allProducts.value.length === 0) {
        result.push(renderGlobal(line))
      } else {
        for (const product of allProducts.value) {
          result.push(renderGlobal(renderProduct(line, product)))
        }
      }
    } else {
      result.push(renderGlobal(line))
    }
  }

  output.value = result.join('\n')
}

// ── 複製 ───────────────────────────────────────────────────
const copyStatus = ref<'idle' | 'success'>('idle')

async function copyAndClose() {
  await navigator.clipboard.writeText(output.value)
  copyStatus.value = 'success'
  setTimeout(() => {
    copyStatus.value = 'idle'
    emit('close')
  }, 800)
}
</script>

<template>
  <mask-component :zIndex="maskZ" @click="emit('close')" />
  <div class="social-modal" :style="{ zIndex: modalZ }">
    <div class="modal-title">社群貼文產生器</div>

    <div class="modal-body">
      <!-- 參數列 -->
      <div class="params-section">
        <div class="params-label">插入參數</div>
        <div class="params-chips">
          <button
            v-for="p in params"
            :key="p.token"
            class="param-chip"
            :class="p.desc"
            @click="insertToken(p.token)"
            :title="p.token"
          >
            {{ p.label }}
            <span class="chip-desc">{{ p.desc }}</span>
          </button>
        </div>
        <div class="params-hint">「逐行」參數所在的行會依商品逐筆展開</div>
      </div>

      <!-- 編輯 / 預覽 並排 -->
      <div class="editor-preview">
        <!-- 編輯區 -->
        <div class="panel">
          <div class="panel-label">模板編輯</div>
          <textarea
            ref="textareaRef"
            class="template-area"
            v-model="template"
            placeholder="在此輸入貼文模板..."
          />
        </div>

        <!-- 輸出區（可編輯） -->
        <div class="panel">
          <div class="panel-label">
            輸出（可直接編輯）
            <span v-if="isLoading" class="loading-hint">載入商品中…</span>
            <span v-else class="product-count">共 {{ allProducts.length }} 件商品</span>
            <button class="re-render-btn" @click="render" :disabled="isLoading">↺ 重新渲染</button>
          </div>
          <textarea class="preview-area" v-model="output" placeholder="渲染結果將顯示於此，可直接編輯…" />
        </div>
      </div>
    </div>

    <!-- 底部按鈕 -->
    <div class="btn-box">
      <button class="btn btn-outline" @click="emit('close')">取消</button>
      <button class="btn btn-copy" @click="copyAndClose" :disabled="copyStatus === 'success'">
        {{ copyStatus === 'success' ? '已複製！' : '確定並複製' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.social-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  width: 820px;
  max-width: 95vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-title {
  background: linear-gradient(135deg, var(--color-secondary-dark) 0%, var(--color-secondary) 100%);
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
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── 參數列 ── */
.params-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.re-render-btn {
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    border-color: var(--color-secondary);
    color: var(--color-secondary-dark);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}

.params-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.params-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.param-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-xl);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.15s;

  &.全域 {
    border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
    color: var(--color-primary-dark);
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    &:hover {
      background: color-mix(in srgb, var(--color-primary) 18%, transparent);
    }
  }

  &.逐行 {
    border-color: color-mix(in srgb, var(--color-secondary) 50%, transparent);
    color: var(--color-secondary-dark);
    background: color-mix(in srgb, var(--color-secondary) 10%, transparent);
    &:hover {
      background: color-mix(in srgb, var(--color-secondary) 22%, transparent);
    }
  }
}

.chip-desc {
  font-size: 0.68rem;
  font-weight: 400;
  opacity: 0.7;
}

.params-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.global-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.global-input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.global-input {
  padding: 0.2rem 0.5rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  width: 90px;
  background: var(--color-surface);
  color: var(--color-text-primary);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

/* ── 編輯 / 預覽 並排 ── */
.editor-preview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1;
  min-height: 320px;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.panel-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-hint {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

.product-count {
  font-size: 0.72rem;
  color: var(--color-secondary-dark);
  font-weight: 400;
}

.template-area {
  flex: 1;
  width: 100%;
  min-height: 280px;
  padding: 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
  line-height: 1.6;
  color: var(--color-text-primary);
  background: var(--color-surface);
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

.preview-area {
  flex: 1;
  min-height: 280px;
  padding: 0.75rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-family: inherit;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  background: color-mix(in srgb, var(--color-secondary) 4%, var(--color-surface));
  color: var(--color-text-primary);
  overflow-y: auto;
  margin: 0;
}

/* ── 底部按鈕 ── */
.btn-box {
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.btn-copy {
  background: var(--color-secondary-dark);
  color: #fff;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--color-secondary);
  }

  &:disabled {
    background: #8bc98b;
    cursor: default;
  }
}

@media (max-width: 640px) {
  .editor-preview {
    grid-template-columns: 1fr;
  }
}
</style>
