<script setup lang="ts">
/**
 * 盲抽結果管理彈窗
 * 顯示指定訂單的抽取結果清單，並支援新增／修改／刪除操作
 */
import { ref, onMounted } from 'vue'
import ModalComponent from '@/components/ModalComponent.vue'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import { orderApi } from '@/services/api/order/order-api'
import type { DrawsData } from '@/services/api/order/order-api-interfaces'
import type { OrderAllContent } from '@/services/api/order/order-api'

const props = defineProps<{
  /** 要查看抽取結果的訂單 */
  order: OrderAllContent
}>()

const emit = defineEmits<{
  /** 關閉彈窗時觸發 */
  (e: 'close'): void
}>()

/** 抽取結果清單 */
const drawsList = ref<DrawsData[]>([])
/** 操作模式：none = 僅顯示清單，create = 新增，edit = 修改，delete = 刪除 */
const innerMode = ref<'none' | 'create' | 'edit' | 'delete'>('none')
/** 修改／刪除時的目標抽取結果 ID */
const currentDrawId = ref(0)
/** 表單：抽取結果 */
const formResult = ref('')
/** 表單：備註 */
const formNote = ref('')
/** 表單驗證錯誤 */
const formResultError = ref('')

onMounted(async () => {
  await loadDraws()
})

/**
 * 從後端取得抽取結果清單
 */
async function loadDraws() {
  drawsList.value = await orderApi.getDrawsResult(props.order.id)
}

/**
 * 開啟新增模式
 */
function openCreate() {
  formResult.value = ''
  formNote.value = ''
  formResultError.value = ''
  innerMode.value = 'create'
}

/**
 * 開啟修改模式
 * @param draw - 目標抽取結果資料
 */
function openEdit(draw: DrawsData) {
  currentDrawId.value = draw.id
  formResult.value = draw.result
  formNote.value = draw.note
  formResultError.value = ''
  innerMode.value = 'edit'
}

/**
 * 開啟刪除確認模式
 * @param draw - 目標抽取結果資料
 */
function openDelete(draw: DrawsData) {
  currentDrawId.value = draw.id
  innerMode.value = 'delete'
}

/**
 * 取消目前操作，返回清單
 */
function cancelInner() {
  innerMode.value = 'none'
}

/**
 * 新增或修改前的欄位驗證
 */
async function beforeConfirmInner(): Promise<boolean> {
  formResultError.value = ''
  if (!formResult.value.trim()) {
    formResultError.value = '結果為必填'
    return false
  }
  return true
}

/**
 * 執行新增／修改／刪除 API，完成後重新載入清單
 */
async function confirmInner() {
  if (innerMode.value === 'create') {
    await orderApi.postDrawsResult(props.order.id, {
      result: formResult.value,
      note: formNote.value,
    })
  } else if (innerMode.value === 'edit') {
    await orderApi.patchDrawsResult(currentDrawId.value, {
      result: formResult.value,
      note: formNote.value,
    })
  } else if (innerMode.value === 'delete') {
    await orderApi.deleteDrawsResult(currentDrawId.value)
  }
  innerMode.value = 'none'
  await loadDraws()
}
</script>

<template>
  <!-- 新增 / 修改表單 -->
  <confirm-modal-component
    v-if="innerMode === 'create' || innerMode === 'edit'"
    :name="innerMode === 'create' ? '新增抽取結果' : '修改抽取結果'"
    :confirmText="innerMode === 'create' ? '確定要新增此抽取結果嗎？' : '確定要修改此抽取結果嗎？'"
    :beforeConfirm="beforeConfirmInner"
    width="420px"
    @cancel="cancelInner"
    @confirm="confirmInner"
  >
    <template #content>
      <div class="draws-form">
        <text-input label="結果" v-model:value="formResult" required :error-message="formResultError" />
        <text-input label="備註" v-model:value="formNote" />
      </div>
    </template>
  </confirm-modal-component>

  <!-- 刪除確認 -->
  <confirm-modal-component
    v-else-if="innerMode === 'delete'"
    name="提示"
    confirmText="確定要刪除此抽取結果嗎？"
    :isDelete="true"
    @cancel="cancelInner"
    @confirm="confirmInner"
  />

  <!-- 清單主彈窗 -->
  <modal-component
    v-else
    :name="`盲抽結果 — ${order.customerName} / ${order.productName}`"
    width="560px"
    @confirm="emit('close')"
    @cancel="emit('close')"
  >
    <template #content>
      <div class="draws-modal-body">
        <div class="draws-toolbar">
          <span class="draws-count">共 {{ drawsList.length }} 筆 / 訂購數量 {{ order.quantity }}</span>
          <div class="btn create" @click="openCreate">新增</div>
        </div>

        <div class="draws-empty" v-if="drawsList.length === 0">尚無抽取結果</div>

        <table class="draws-table" v-else>
          <thead>
            <tr>
              <th>結果</th>
              <th>備註</th>
              <th class="draws-actions-th"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="draw in drawsList" :key="draw.id">
              <td>{{ draw.result }}</td>
              <td class="draws-note">{{ draw.note }}</td>
              <td class="draws-actions">
                <span class="action-btn edit-btn" @click="openEdit(draw)">編輯</span>
                <span class="action-btn delete-btn" @click="openDelete(draw)">刪除</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </modal-component>
</template>

<style scoped>
.draws-modal-body {
  padding: 0.75rem 0.5rem;
}

.draws-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;

  .draws-count {
    font-size: 0.85rem;
    color: #666;
  }
}

.draws-empty {
  text-align: center;
  color: #999;
  padding: 1.5rem 0;
  font-size: 0.9rem;
}

.draws-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th,
  td {
    padding: 0.4rem 0.6rem;
    border: 1px solid #ddd;
    text-align: left;
  }

  th {
    background: var(--color-primary);
    color: #fff;
    font-weight: 500;
  }

  tbody tr:nth-child(even) td {
    background: #f9f9f9;
  }

  .draws-note {
    color: #777;
    font-size: 0.85rem;
  }

  .draws-actions-th {
    width: 100px;
  }

  .draws-actions {
    white-space: nowrap;
  }
}

.action-btn {
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  margin-right: 0.25rem;

  &.edit-btn {
    color: var(--color-primary);
    border: 1px solid var(--color-primary);
    &:hover {
      background: var(--color-primary);
      color: #fff;
    }
  }

  &.delete-btn {
    color: var(--color-danger);
    border: 1px solid var(--color-danger);
    &:hover {
      background: var(--color-danger);
      color: #fff;
    }
  }
}

.draws-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.5rem;
  margin-top: 0.5rem;
}
</style>
