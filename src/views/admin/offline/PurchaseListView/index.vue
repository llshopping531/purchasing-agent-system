<script setup lang="ts">
/**
 * 採購清單頁面
 * 選取活動後，顯示各通路的採購統計（依通路分組，可個別收合）
 */
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import type { HeaderRow } from '@/components/tables/TableComponent.vue'
import type { Option } from '@/interfaces/common'
import { purchaseListApi, type AdditionalProp } from '@/services/api/purchase-api'
import { ref } from 'vue'
import PurchaseChannelItem from './PurchaseChannelItem.vue'

/** 單一通路的採購統計資料結構 */
interface PurchaseList {
  /** 通路名稱 */
  channelName: string
  /** 該通路的採購明細 */
  data: AdditionalProp[]
}

/** 表格欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '商品名稱', value: 'productName', sort: 0, width: '200px' },
  { name: '應買數量', value: 'shouldBuy', sort: 0, width: '100px' },
  { name: '已買數量', value: 'purchased', sort: 0, width: '100px' },
  { name: '未買數量', value: 'remaining', sort: 0, width: '100px' },
])

/** 依通路整理後的採購清單 */
const purchaseList = ref<PurchaseList[]>([])

/**
 * 選取活動後，從 API 取得採購統計並轉換為以通路為單位的陣列
 * @param option - 選取的活動 Option
 */
async function selectEvent(option: Option) {
  const res = await purchaseListApi.getPurchaseListsAll({ eventId: Number(option.value) })
  purchaseList.value = Object.keys(res).map((key) => ({
    channelName: key,
    data: res[key] ?? [],
  }))
}
</script>

<template>
  <div class="purchase">
    <div class="selectBox">
      <event-select-component @select-option="selectEvent"></event-select-component>
    </div>
    <purchase-channel-item
      v-for="purchase in purchaseList"
      :key="purchase.channelName"
      :channelName="purchase.channelName"
      :data="purchase.data"
      :headerRow="headerRow"
    ></purchase-channel-item>
  </div>
</template>

<style scoped>
.purchase {
  width: fit-content;
}
</style>
