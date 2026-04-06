<script setup lang="ts">
/**
 * 訂單表格元件
 * 整合訂單列表查詢、分頁、詳細資料彈窗，並向上 emit 編輯／刪除事件
 */
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { fieldDefsApi } from '@/services/api/sys/field-defs-api'
import { orderApi, type OrderAllContent } from '@/services/api/order/order-api'
import { onMounted, ref, watch } from 'vue'
import OrderDetailModal from './OrderDetailModal.vue'

const pop = defineProps<{
  /** 目前選取的活動 ID（字串形式） */
  currentEventId: string
  /** 目前選取的通路 ID（字串形式） */
  currentShopId: string
  /** 是否可操作 */
  isOperate: boolean
}>()

const emit = defineEmits<{
  /** 訂單列表載入完成後觸發，帶出當頁全部資料 */
  (e: 'tableData', data: OrderAllContent[]): void
  /** 點擊刪除時觸發，帶出目標訂單資料 */
  (e: 'delete', data: OrderAllContent): void
  /** 點擊編輯時觸發，帶出目標訂單資料 */
  (e: 'edit', data: OrderAllContent): void
}>()

/** 表頭欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '購買者', value: 'customerName', sort: 0, width: '150px' },
  { name: '品項', value: 'productName', sort: 0, width: '300px', mobileSpan: 2 },
  { name: '數量', value: 'quantity', sort: 0, width: '70px' },
  { name: '訂單狀態', value: 'orderStatusName', sort: 0, width: '100px' },
  { name: '更多資訊', value: 'more', sort: 0, width: '100px' },
])

/** 當前頁的訂單資料 */
const tableData = ref<OrderAllContent[]>([])
/** 詳細資料彈窗中顯示的訂單 */
const selectedOrder = ref<OrderAllContent | null>(null)
/** 是否顯示訂單詳細資料彈窗 */
const isShowDetailModal = ref(false)
/** 系統自定義欄位定義清單（用於詳細資料彈窗動態欄位） */
const extraFields = ref<{ name: string; value: string }[]>([])

/** 當前頁碼（0-based） */
const currentPage = ref(0)
/** 每頁筆數 */
const pageSize = ref(20)
/** 總頁數 */
const totalPages = ref(0)
/** 總筆數 */
const totalElements = ref(0)

/**
 * 開啟訂單詳細資料彈窗
 * @param data - 要顯示的訂單資料
 */
function openDetail(data: OrderAllContent) {
  selectedOrder.value = data
  isShowDetailModal.value = true
}

onMounted(() => {
  getFieldDefsApi()
})

defineExpose({ refresh: getOrderList })

// 當活動或通路切換時，重置頁碼並重新查詢
watch(
  () => [pop.currentEventId, pop.currentShopId],
  () => {
    currentPage.value = 0
    getOrderList()
  },
)

/**
 * 向上 emit 刪除事件
 * @param data - 目標訂單資料
 */
function deleteData(data: OrderAllContent) {
  emit('delete', data)
}

/**
 * 向上 emit 編輯事件
 * @param data - 目標訂單資料
 */
function editData(data: OrderAllContent) {
  emit('edit', data)
}

/**
 * 換頁
 * @param page - 目標頁碼（0-based）
 */
function onChangePage(page: number) {
  currentPage.value = page
  getOrderList()
}

/**
 * 更改每頁筆數
 * @param size - 新的每頁筆數
 */
function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getOrderList()
}

/**
 * 從後端取得 ORDER 實體的自定義欄位定義，供詳細資料彈窗顯示動態欄位
 */
async function getFieldDefsApi() {
  const res = await fieldDefsApi.getfieldDefs({ entityType: 'ORDER' })
  extraFields.value = res.content.map((item) => ({ name: item.fieldLabel, value: item.fieldKey }))
}

/**
 * 依目前活動 ID、通路 ID 及分頁條件查詢訂單清單
 * 活動或通路未選取時不發送請求
 */
async function getOrderList() {
  if (pop.currentEventId !== '' && pop.currentShopId !== '') {
    const res = await orderApi.getOrders({
      eventId: Number(pop.currentEventId),
      channelId: Number(pop.currentShopId),
      page: currentPage.value,
      size: pageSize.value,
    })
    tableData.value = res.content
    totalPages.value = res.totalPages
    totalElements.value = res.totalElements
    emit('tableData', tableData.value)
  }
}
</script>

<template>
  <div class="orderTable">
    <table-component
      :headerRow="headerRow"
      :is-edit="isOperate"
      :is-delete="isOperate"
      :tableData="tableData"
      :totalPages="totalPages"
      :currentPage="currentPage"
      :totalElements="totalElements"
      :pageSize="pageSize"
      @delete="deleteData"
      @edit="editData"
      @change-page="onChangePage"
      @change-size="onChangeSize"
    >
      <template #col-orderStatusName="{ row }">
        <span :class="{ cancelled: row.orderStatusName === '已取消' }">
          {{ row.orderStatusName }}
        </span>
      </template>
      <template #col-more="{ row }">
        <div class="detail-btn" @click="openDetail(row)">
          <span class="detail-icon"></span>
        </div>
      </template>
    </table-component>
  </div>

  <order-detail-modal
    v-if="isShowDetailModal && selectedOrder"
    :order="selectedOrder"
    :extraFields="extraFields"
    @close="isShowDetailModal = false"
  />
</template>

<style scoped>
.cancelled {
  color: var(--color-danger);
  text-decoration: line-through;
  opacity: 0.8;
}

.detail-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  .detail-icon {
    display: block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-primary);
    border-radius: 50%;
    position: relative;
    &::before {
      content: 'i';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 11px;
      font-style: italic;
      font-weight: bold;
      color: var(--color-primary);
      line-height: 1;
    }
  }
  &:hover .detail-icon {
    border-color: var(--color-primary-dark);
    &::before {
      color: var(--color-primary-dark);
    }
  }
}
</style>
