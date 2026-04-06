<script setup lang="ts">
/**
 * 訂單管理頁面
 * 選取活動與通路後顯示訂單列表，提供新增／編輯／刪除操作，
 * 並可開啟統計彈窗查看各商品的訂單數量匯總
 */
import { ref } from 'vue'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/selects/ShopSelectComponent.vue'
import OrderTableComponent from '@/components/tables/OrderTableComponent/index.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import OrderFormModal from './OrderFormModal.vue'
import type { Option } from '@/interfaces/common'
import type { OrderQueryContent } from '@/services/api/order/order-api-interfaces'

/** OrderTableComponent 的 ref，用於呼叫 refresh 重新載入列表 */
const orderTableRef = ref<InstanceType<typeof OrderTableComponent>>()
/** OrderFormModal 的 ref，用於呼叫 createOrder / editOrder / deleteOrder */
const orderFormModalRef = ref<InstanceType<typeof OrderFormModal>>()

/** 目前選取的活動 ID */
const currentEventId = ref('')
/** 目前選取的通路 ID */
const currentShopId = ref('')
/** 是否已執行過查詢（用於控制新增按鈕顯示） */
const isTableQueried = ref(false)
/** 是否顯示統計按鈕（有資料時才顯示） */
const isShowTotalBtn = ref(false)
/** 是否顯示統計彈窗 */
const isShowTotalModal = ref(false)

/** 統計彈窗的表格資料（各商品名稱與數量） */
const tableData = ref<{ name: string; value: number }[]>([])
/** 統計彈窗的表頭欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '品項', value: 'name', sort: 0, width: '300px' },
  { name: '數量', value: 'value', sort: 0, width: '70px' },
])

/**
 * 選取活動
 * @param data - 選取的活動 Option
 */
function selectEvent(data: Option) {
  currentEventId.value = data.value
}

/**
 * 選取通路
 * @param data - 選取的通路 Option
 */
function selectShop(data: Option) {
  currentShopId.value = data.value
}

/**
 * 接收 OrderTableComponent emit 的訂單資料，
 * 彙整各商品數量並加入總計列，供統計彈窗使用
 * @param data - 當頁全部訂單資料
 */
function getTableData(data: OrderQueryContent[]) {
  isTableQueried.value = true
  if (data.length !== 0) isShowTotalBtn.value = true

  /** 各訂單的品項與數量 */
  const itemData = data.map((item) => ({ name: item.productName, value: item.quantity }))
  /** 各商品訂單數量加總 */
  let total = 0
  const result = Object.values(
    itemData.reduce(
      (acc: Record<string, { name: string; value: number }>, cur) => {
        total += cur.value
        if (!acc[cur.name])
          acc[cur.name] = { name: cur.name, value: 0 }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(acc[cur.name] as any).value += cur.value
        return acc
      },
      {} as Record<string, { name: string; value: number }>,
    ),
  )
  result.push({ name: '總計', value: total })
  tableData.value = result
}

/**
 * 新增／修改／刪除完成後，重新整理訂單列表
 */
function onConfirmed() {
  orderTableRef.value?.refresh()
}
</script>

<template>
  <div class="order">
    <h3>訂單管理</h3>
    <p>請選擇場販場次、通路</p>
    <div class="orderHeader">
      <div class="selectBox">
        <event-select-component @selectOption="selectEvent" />
        <shop-select-component :eventId="currentEventId" @selectOption="selectShop" />
      </div>
      <div class="btn" v-if="isShowTotalBtn" @click="isShowTotalModal = true">顯示統計</div>
      <div class="btn create" v-if="isTableQueried" @click="orderFormModalRef?.createOrder()">
        新增
      </div>
    </div>
    <order-table-component
      ref="orderTableRef"
      :currentEventId="currentEventId"
      :currentShopId="currentShopId"
      @tableData="getTableData"
      @delete="orderFormModalRef?.deleteOrder($event)"
      @edit="orderFormModalRef?.editOrder($event)"
    />
    <router-view />

    <modal-component name="統計" @confirm="isShowTotalModal = false" v-if="isShowTotalModal">
      <template #content>
        <div class="totalTable">
          <table-component
            :headerRow="headerRow"
            :tableData="tableData"
            :isDelete="false"
            :isEdit="false"
          />
        </div>
      </template>
    </modal-component>

    <order-form-modal
      ref="orderFormModalRef"
      :eventId="currentEventId"
      :shopId="currentShopId"
      @confirmed="onConfirmed"
    />
  </div>
</template>

<style scoped>
.order {
  margin-top: 1rem;
  .selectBox {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .orderHeader {
    display: flex;
    gap: 1rem;
    align-items: center;
    .btn {
      margin-top: 1.5rem;
    }
  }
  .totalTable {
    width: fit-content;
    margin: auto;
    background: #eeee;
    padding: 0.25rem;
  }
}
</style>
