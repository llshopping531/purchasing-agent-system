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

const pops = defineProps<{
  /** 通路名稱（作為標題顯示） */
  channelName: string
  /** 活動 ID） */
  eventId: number
  /** 該通路的採購明細資料 */
  data: PurchaseListData[]
}>()

/** 表格欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '商品名稱', value: 'productName', sort: 0, width: '200px', mobileSpan: 2 },
  { name: '應買數量', value: 'shouldBuy', sort: 0, width: '100px' },
  { name: '已買數量', value: 'purchased', sort: 0, width: '100px' },
  { name: '未買數量', value: 'remaining', sort: 0, width: '100px' },
])

const detailHeaderRow = ref<HeaderRow[]>([
  { name: '顧客名稱', value: 'customerName', sort: 0, width: '100px' },
  { name: '喊單數量', value: 'quantity', sort: 0, width: '100px' },
  { name: '購買狀況', value: 'orderStatusName', sort: 0, width: '100px' },
])

/** 是否展開採購明細表格 */
const isOpen = ref(true)
const currentDetail = ref<PurchaseDetail[]>([])
const isShowDetailModal = ref<boolean>(false)

/**
 * 切換展開／收合狀態
 */
function toggle() {
  isOpen.value = !isOpen.value
}

/**
 * 點擊產品名稱，觸發開啟詳細彈窗
 * @param id 商品 ID
 */
async function oponDetail(data: PurchaseListData) {
  console.log('oponDetail')
  const req: QueryPurchaseDetailReq = {
    eventId: Number(pops.eventId),
    channelId: data.channelId,
    productId: data.productId,
  }
  const res = await purchaseListApi.getPurchassDetail(req)
  currentDetail.value = res
  isShowDetailModal.value = true
}
</script>

<template>
  <div>
    <div class="titleBox" @click="toggle" style="margin: 1rem 0;">
      <h3>{{ channelName }}</h3>
      <div class="toggleBtn">
        <span class="icon" :class="{ active: isOpen }"></span>
      </div>
    </div>
    <div v-if="isOpen">
      <table-component :headerRow="headerRow" :tableData="data" :isDelete="false" :isEdit="false">
        <template #col-productName="{ row }">
          <div @click="oponDetail(row)" style="width: 100%;cursor: pointer">
            {{ row.productName }}
          </div>
        </template>
      </table-component>
    </div>
  </div>
  <modal-component v-if="isShowDetailModal" name="詳細資料" @confirm="isShowDetailModal = false">
    <template #content>
      <div style="width: 100%">
        <table-component
          :headerRow="detailHeaderRow"
          :tableData="currentDetail"
          :isDelete="false"
          :isEdit="false"
        ></table-component>
      </div>
    </template>
  </modal-component>
</template>

<style scoped>
.titleBox {
  display: flex;
  cursor: pointer;
}
.toggleBtn {
  position: relative;
  font-size: 2rem;
  width: 50px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
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
    &.active {
      transform: translate(-50%, -65%) rotate(315deg);
    }
  }
}
</style>
