<script setup lang="ts">
/**
 * 訂單表格元件
 * 整合訂單列表查詢、分頁、詳細資料彈窗，並向上 emit 編輯／刪除事件
 */
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import OrderStatusSelectComponent from '@/components/inputs/selects/OrderStatusSelectComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import { fieldDefsApi } from '@/services/api/system/sys/field-defs-api'
import { orderApi, type OrderAllContent } from '@/services/api/offline/order/order-api'
import { onMounted, ref, watch } from 'vue'
import { isInactiveOrder } from '@/utils/order'
import { formatTwd } from '@/utils/format'
import PurchaserSelectComponent from '@/components/inputs/selects/PurchaserSelectComponent.vue'
import OrderDetailModal from './OrderDetailModal.vue'
import DrawsResultModal from './DrawsResultModal.vue'

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
  /** 點擊插入下一筆時觸發，帶出目標訂單資料 */
  (e: 'insert', data: OrderAllContent): void
}>()

/** 表頭欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '客戶', value: 'customerName', sort: 0, width: '150px', sortable: true },
  { name: '品項', value: 'productName', sort: 1, width: '300px', mobileSpan: 2, sortable: true },
  { name: '數量', value: 'quantity', sort: 2, width: '70px' },
  { name: '台幣小計', value: 'subtotalTwd', sort: 3, width: '90px' },
  { name: '訂單狀態', value: 'orderStatusName', sort: 4, width: '130px', sortable: true },
  { name: '購買確認', value: 'purchaseConfirm', sort: 5, width: '85px' },
  { name: '備註', value: 'note', sort: 6, sortable: true },
  { name: '採購者', value: 'purchaser', sort: 7, width: '100px', sortable: true },
  { name: '更多', value: 'more', sort: 8, width: '230px' },
])

/** 目前排序欄位 */
const sortField = ref<string | undefined>(undefined)
/** 目前排序方向 */
const sortDirection = ref<'ASC' | 'DESC' | undefined>(undefined)

/** 當前頁的訂單資料 */
const tableData = ref<OrderAllContent[]>([])
/** 詳細資料彈窗中顯示的訂單 */
const selectedOrder = ref<OrderAllContent | null>(null)
/** 是否顯示訂單詳細資料彈窗 */
const isShowDetailModal = ref(false)
/** 盲抽結果彈窗中顯示的訂單 */
const selectedBlindOrder = ref<OrderAllContent | null>(null)
/** 是否顯示盲抽結果彈窗 */
const isShowDrawsModal = ref(false)
/** 系統自定義欄位定義清單（用於詳細資料彈窗動態欄位） */
const extraFields = ref<{ name: string; value: string }[]>([])
/** 客戶或商品名稱篩選關鍵字 */
const keyword = ref('')
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

/**
 * 開啟盲抽結果管理彈窗
 * @param data - 目標訂單資料
 */
function openDraws(data: OrderAllContent) {
  selectedBlindOrder.value = data
  isShowDrawsModal.value = true
}


onMounted(() => {
  getFieldDefsApi()
})

defineExpose({ refresh: getOrderList })

// 當活動或通路切換時，重置頁碼並重新查詢（immediate 確保元件掛載時也會執行）
watch(
  () => [pop.currentEventId, pop.currentShopId],
  () => {
    currentPage.value = 0
    getOrderList()
  },
  { immediate: true },
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
 * 向上 emit 插入下一筆事件
 * @param data - 目標訂單資料（新訂單將插入此筆之後）
 */
function insertData(data: OrderAllContent) {
  emit('insert', data)
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
 * 點擊欄位排序
 */
function onSort(field: string, direction: 'ASC' | 'DESC') {
  sortField.value = field
  sortDirection.value = direction
  currentPage.value = 0
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
  if (!pop.currentEventId || !pop.currentShopId) return
  const res = await orderApi.getOrders({
    eventId: Number(pop.currentEventId),
    channelId: Number(pop.currentShopId),
    page: currentPage.value,
    size: pageSize.value,
    sort: sortField.value ?? 'sortOrder',
    direction: sortDirection.value ?? 'ASC',
    keyword: keyword.value || undefined,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
  emit('tableData', tableData.value)
}

function closeDrawsModal() {
  getOrderList()
  isShowDrawsModal.value = false
}

/**
 * 直接在列表更新訂單狀態
 * @param row - 目標訂單資料
 * @param newStatus - 新的訂單狀態值
 */
async function updateOrderStatus(row: OrderAllContent, newStatus: string) {
  await orderApi.patchOrders(row.id, {
    eventId: row.eventId,
    channelId: row.channelId,
    customerId: row.customerId,
    productId: row.productId,
    quantity: row.quantity,
    exchangeRate: row.exchangeRate,
    subtotalJpy: row.subtotalJpy,
    subtotalTwd: row.subtotalTwd,
    orderStatus: newStatus,
    nonBonusTarget: row.nonBonusTarget,
    isFixedRate: row.isFixedRate,
    nonCutTarget: row.nonCutTarget,
    purchaser:row.purchaser,
    purchaseConfirm: row.purchaseConfirm,
    note: row.note,
  })
  await getOrderList()
}

async function updatePurchaseConfirm(row: OrderAllContent, value: boolean) {
  await orderApi.patchOrders(row.id, {
    eventId: row.eventId,
    channelId: row.channelId,
    customerId: row.customerId,
    productId: row.productId,
    quantity: row.quantity,
    exchangeRate: row.exchangeRate,
    subtotalJpy: row.subtotalJpy,
    subtotalTwd: row.subtotalTwd,
    orderStatus: row.orderStatus,
    nonBonusTarget: row.nonBonusTarget,
    isFixedRate: row.isFixedRate,
    nonCutTarget: row.nonCutTarget,
    purchaser:row.purchaser,
    purchaseConfirm: value,
    note: row.note,
  })
  row.purchaseConfirm = value
}

async function updateOrderPurchaser(row: OrderAllContent, purchaser: string) {
  await orderApi.patchOrders(row.id, {
    eventId: row.eventId,
    channelId: row.channelId,
    customerId: row.customerId,
    productId: row.productId,
    quantity: row.quantity,
    exchangeRate: row.exchangeRate,
    subtotalJpy: row.subtotalJpy,
    subtotalTwd: row.subtotalTwd,
    orderStatus: row.orderStatus,
    nonBonusTarget: row.nonBonusTarget,
    isFixedRate: row.isFixedRate,
    nonCutTarget: row.nonCutTarget,
    purchaseConfirm: row.purchaseConfirm,
    note: row.note,
    purchaser,
  })
  row.purchaser = purchaser
}

function filterCustomer() {
  currentPage.value = 0
  getOrderList()
}
</script>

<template>
  <div class="orderTable">
    <div class="filter-bar">
      <text-input
        label="客戶或商品名稱"
        :value="keyword"
        @update:value="keyword = String($event)"
      />
      <div class="btn filter-btn" @click="filterCustomer()">確定</div>
    </div>
    <table-component
      :headerRow="headerRow"
      :is-edit="isOperate"
      :is-delete="isOperate"
      :tableData="tableData"
      :totalPages="totalPages"
      :currentPage="currentPage"
      :totalElements="totalElements"
      :pageSize="pageSize"
      :sortField="sortField"
      :sortDirection="sortDirection"
      :rowClass="(row) => isInactiveOrder(row.orderStatusName) ? 'inactive' : ''"
      @sort="onSort"
      @delete="deleteData"
      @edit="editData"
      @change-page="onChangePage"
      @change-size="onChangeSize"
    >
      <template #col-customerName="{ row }">
        <span>{{ row.customerName }}</span>
      </template>
      <template #col-productName="{ row }">
        <span class="product-name-cell">
          {{ row.productName }}
          <span v-if="row.isBlindBox" class="blind-tag">盲抽</span>
        </span>
      </template>
      <template #col-purchaser="{ row }">
        <purchaser-select-component
          :is-display-label="false"
          :defaultValue="row.purchaser"
          @selectOption="updateOrderPurchaser(row, $event.value ?? '')"
        />
      </template>
      <template #col-subtotalTwd="{ row }">
        <span>
          <span
            v-if="(!row.subtotalTwd || String(row.subtotalTwd) === '-') && !isInactiveOrder(row.orderStatusName)"
            class="warn-icon"
            title="台幣小計為空"
          >!</span>
          {{ formatTwd(row.subtotalTwd) }}
        </span>
      </template>
      <template #col-orderStatusName="{ row }">
        <order-status-select-component
          :defaultValue="row.orderStatus"
          @selectOption="updateOrderStatus(row, $event.value ?? '')"
          :isDisplayLable="false"
        ></order-status-select-component>
      </template>
      <template #col-purchaseConfirm="{ row }">
        <checkbox-input
          :modelValue="row.purchaseConfirm"
          label=""
          @update:modelValue="isOperate && updatePurchaseConfirm(row, !!$event)"
        />
      </template>
      <template #col-more="{ row }">
        <div class="more-icons">
          <div class="detail-btn more-btn" @click="openDetail(row)">
            <span class="detail-icon"></span>資訊
          </div>
          <div
            v-if="isOperate"
            class="insert-btn more-btn"
            @click="insertData(row)"
            title="在此筆後插入新訂單"
          >
            插入下一筆
          </div>
          <div
            class="draws-btn more-btn"
            v-if="row.isBlindBox && row.orderStatus !== '1'"
            @click="openDraws(row)"
            title="查看盲抽結果"
          >
            <span class="draws-icon"></span>拆拆<template v-if="row.drawCount"
              >({{ row.drawCount }})</template
            >
          </div>
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

  <draws-result-modal
    v-if="isShowDrawsModal && selectedBlindOrder"
    :order="selectedBlindOrder"
    @close="closeDrawsModal"
  />
</template>

<style scoped>

.filter-bar {
  margin-bottom: 0.75rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}
.filter-btn {
  white-space: nowrap;
}
.warn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d97706;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
  margin-right: 0.25rem;
}
.product-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.blind-tag {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 99px;
  font-size: 0.68rem;
  font-weight: 700;
  background: color-mix(in srgb, #d97706 15%, transparent);
  color: #d97706;
  white-space: nowrap;
}

.more-btn {
  display: flex;
  gap: 0.25rem;
  &.draws-btn {
    color: #d97708;
  }
  &.detail-btn {
    color: #7c70e0;
  }
  &.insert-btn {
    color: #16a34a;
    cursor: pointer;
    font-size: 0.8rem;
    &:hover {
      text-decoration: underline;
    }
  }
}
.more-icons {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
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

.draws-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  .draws-icon {
    display: block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-warning, #d97706);
    border-radius: 3px;
    position: relative;
    &::before {
      content: '?';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 11px;
      font-weight: bold;
      color: var(--color-warning, #d97706);
      line-height: 1;
    }
  }
  &:hover .draws-icon {
    border-color: #b45309;
    &::before {
      color: #b45309;
    }
  }
}
</style>
