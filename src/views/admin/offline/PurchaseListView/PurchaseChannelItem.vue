<script setup lang="ts">
/**
 * 採購清單通路項目元件
 * 顯示單一通路名稱，點擊後可展開／收合該通路的採購明細表格
 * isOpen 狀態內聚於此元件，不由父層管理
 */
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import type {
  PurchaseDetail,
  PurchaseListData,
  QueryPurchaseDetailReq,
} from '@/services/api/purchase/purchase-api-interface'
import { ref } from 'vue'
import { purchaseListApi } from '@/services/api/purchase/purchase-api'
import ModalComponent from '@/components/ModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'

const emit = defineEmits<{ refresh: [] }>()

const pops = defineProps<{
  /** 通路名稱（作為標題顯示） */
  channelName: string
  /** 活動 ID */
  eventId: number
  /** 是否可操作 */
  isOperate?:boolean
  /** 該通路的採購明細資料 */
  data: PurchaseListData[]
}>()

/** 主表格欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '商品名稱', value: 'productName', sort: 0, width: '200px', mobileSpan: 2 },
  { name: '應買數量', value: 'shouldBuy', sort: 0, width: '100px' },
  { name: '已買數量', value: 'purchased', sort: 0, width: '100px' },
  { name: '未買數量', value: 'remaining', sort: 0, width: '100px' },
])

/** 明細彈窗表格欄位定義 */
const detailHeaderRow = ref<HeaderRow[]>([
  { name: '顧客名稱', value: 'customerName', sort: 0, width: '100px' },
  { name: '喊單數量', value: 'quantity', sort: 0, width: '100px' },
  { name: '購買狀況', value: 'orderStatusName', sort: 0, width: '100px' },
])

/** 是否展開採購明細表格 */
const isOpen = ref(true)
/** 當前查看的採購明細列表 */
const currentDetail = ref<PurchaseDetail[]>([])
/** 是否顯示詳細資料彈窗 */
const isShowDetailModal = ref<boolean>(false)
/** 是否顯示採購情況回報彈窗 */
const isOpenCheckModal = ref<boolean>(false)
/** 當前選取的採購資料列 */
const selectedData = ref<PurchaseListData>()
/** 已買數量（雙向綁定至父層） */
const buyedNum = defineModel<number>('buyedNum', { default: 0 })
/** 是否顯示採購確認彈窗 */
const isOpenCheckConfirmModal = ref<boolean>(false)

/**
 * 切換展開／收合狀態
 */
function toggle() {
  isOpen.value = !isOpen.value
}

/**
 * 點擊商品名稱，開啟詳細彈窗並查詢明細資料
 * @param data 採購資料列
 */
async function oponDetail(data: PurchaseListData) {
  getDetail(data)
  isShowDetailModal.value = true
}

/**
 * 點擊編輯按鈕，開啟採購回報彈窗並查詢明細資料
 * @param data 採購資料列
 */
function purchaseCheck(data: PurchaseListData) {
  getDetail(data)
  selectedData.value = data
  buyedNum.value = data.purchased
  isOpenCheckModal.value = true
}

/**
 * 查詢指定商品的採購明細
 * @param data 採購資料列（含 channelId、productId）
 */
async function getDetail(data: PurchaseListData) {
  const req: QueryPurchaseDetailReq = {
    eventId: Number(pops.eventId),
    channelId: data.channelId,
    productId: data.productId,
  }
  const res = await purchaseListApi.getPurchassDetail(req)
  currentDetail.value = res
}

/**
 * 確認送出已買數量，關閉回報與確認彈窗
 */
function confirmBuyed() {
  console.log(buyedNum.value)
  isOpenCheckConfirmModal.value = false
  isOpenCheckModal.value = false
  modifyOrderStatus()
}

async function modifyOrderStatus() {
  let accumulated = 0
  const toBePurchasedIds: number[] = []
  const toBeCalledIds: number[] = []

  for (const order of currentDetail.value) {
    if (accumulated + order.quantity <= buyedNum.value) {
      accumulated += order.quantity
      if (order.orderStatus !== '2') toBePurchasedIds.push(order.id)
    } else {
      if (order.orderStatus !== '1') toBeCalledIds.push(order.id)
    }
  }

  await Promise.all([
    ...toBeCalledIds.map((id) => purchaseListApi.modifyOrderStatus(id, { orderStatus: '1' })),
    ...toBePurchasedIds.map((id) => purchaseListApi.modifyOrderStatus(id, { orderStatus: '2' })),
  ])
  emit('refresh')
}
</script>

<template>
  <div>
    <!-- 通路標題列：點擊展開／收合 -->
    <div class="titleBox" @click="toggle">
      <h3>{{ channelName }}</h3>
      <div class="toggleBtn">
        <span class="icon" :class="{ active: isOpen }"></span>
      </div>
    </div>

    <!-- 採購明細表格 -->
    <div v-if="isOpen">
      <table-component
        :headerRow="headerRow"
        :tableData="data"
        :is-edit="isOperate"
        :is-delete="false"
        @edit="purchaseCheck"
      >
        <!-- 商品名稱欄：可點擊開啟詳細彈窗 -->
        <template #col-productName="{ row }">
          <div class="product-name-cell" @click="oponDetail(row)">
            {{ row.productName }}
          </div>
        </template>
      </table-component>
    </div>
  </div>

  <!-- 詳細資料彈窗 -->
  <modal-component v-if="isShowDetailModal" name="詳細資料" @confirm="isShowDetailModal = false">
    <template #content>
      <div class="modal-table-wrapper">
        <table-component
          :headerRow="detailHeaderRow"
          :tableData="currentDetail"
          :isDelete="false"
          :isEdit="false"
        ></table-component>
      </div>
    </template>
  </modal-component>

  <!-- 採購情況回報彈窗 -->
  <modal-component v-if="isOpenCheckModal" name="採購情況回報" @confirm="isOpenCheckModal = false">
    <template #content>
      <!-- 商品名稱 -->
      <p class="product-title">{{ selectedData?.productName }}</p>

      <!-- 採購數量摘要 -->
      <div class="purchase-summary">
        <span>應買數量 {{ selectedData?.shouldBuy }}</span>
        <span class="divider">|</span>
        <span>已買數量 {{ selectedData?.purchased }}</span>
        <span class="divider">|</span>
        <span>未買數量 {{ selectedData?.remaining }}</span>
      </div>

      <!-- 已買回報輸入 -->
      <p class="section-label">已買回報：</p>
      <div class="report-section">
        <text-input label="購買數量" v-model:value="buyedNum" />
        <div class="btn" @click="isOpenCheckConfirmModal = true">確定回報</div>
      </div>

      <!-- 明細表格 -->
      <p class="section-label">明細：</p>
      <table-component
        :headerRow="detailHeaderRow"
        :tableData="currentDetail"
        :isDelete="false"
        :isEdit="false"
      ></table-component>
    </template>
  </modal-component>

  <!-- 採購送出確認彈窗 -->
  <modal-component
    v-if="isOpenCheckConfirmModal"
    :isShowCancelBtn="true"
    name="採購確認"
    @confirm="confirmBuyed"
    @cancel="isOpenCheckConfirmModal = false"
  >
    <template #content> 已購買{{ buyedNum }}項，您確定要送出嗎？ </template>
  </modal-component>
</template>

<style scoped>
/* 通路標題列 */
.titleBox {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 1rem 0;
}

/* 展開／收合按鈕容器 */
.toggleBtn {
  position: relative;
  font-size: 2rem;
  width: 50px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

  /* 箭頭圖示（以 border 模擬） */
  .icon {
    position: absolute;
    display: block;
    border-left: 3px solid var(--color-primary);
    border-bottom: 3px solid var(--color-primary);
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%) rotate(135deg);
    transition: all 0.3s;
    z-index: -1;

    /* 展開狀態：箭頭朝上 */
    &.active {
      transform: translate(-50%, -65%) rotate(315deg);
    }
  }
}

/* 商品名稱欄：可點擊樣式 */
.product-name-cell {
  width: 100%;
  cursor: pointer;
}

/* 彈窗內表格容器 */
.modal-table-wrapper {
  width: 100%;
}

/* 採購回報彈窗：商品標題 */
.product-title {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

/* 採購數量摘要列 */
.purchase-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;

  .divider {
    color: var(--color-border, #ccc);
  }
}

/* 區塊標籤文字 */
.section-label {
  margin-bottom: 0.5rem;
}

/* 已買回報輸入區塊 */
.report-section {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: end;
}
</style>
