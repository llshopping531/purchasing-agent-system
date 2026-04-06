<script setup lang="ts">
/**
 * 採購清單頁面
 * 選取活動後，顯示各通路的採購統計（依通路分組，可個別收合）
 */
import EventSelectComponent, { type EventOption } from '@/components/inputs/selects/EventSelectComponent.vue'
import type { Option } from '@/interfaces/common'
import { ref } from 'vue'
import PurchaseChannelItem from './PurchaseChannelItem.vue'
import type { PurchaseListData } from '@/services/api/purchase/purchase-api-interface'
import { purchaseListApi } from '@/services/api/purchase/purchase-api'
import ShopSelectComponent from '@/components/inputs/selects/ShopSelectComponent.vue'

/** 單一通路的採購統計資料結構 */
interface PurchaseList {
  /** 通路名稱 */
  channelName: string
  /** 該通路的採購明細 */
  data: PurchaseListData[]
}
/** 當前活動 ID */
const currentEventId = ref(0)
/** 依通路整理後的採購清單 */
const purchaseList = ref<PurchaseList[]>([])
/** 顯示用採購清單 */
const displayPurchaseList = ref<PurchaseList[]>([])
/** 是否顯示通路下拉 */
const isShowChannelSelect = ref<boolean>(false)
  /** 當前通路是否已鎖定 */
const currentEventIsLocked = ref(true)

/**
 * 選取活動後，從 API 取得採購統計並轉換為以通路為單位的陣列
 * @param option - 選取的活動 Option
 */
async function fetchPurchaseList() {
  const res = await purchaseListApi.getPurchaseListsAll(currentEventId.value)
  purchaseList.value = Object.keys(res).map((key) => ({
    channelName: key,
    data: res[key] ?? [],
  }))
  displayPurchaseList.value = purchaseList.value
}

async function selectEvent(data: EventOption) {
  currentEventId.value = Number(data.selectedData.value)
  currentEventIsLocked.value = data.isLocked
  await fetchPurchaseList()
  isShowChannelSelect.value = true
}

/**
 * 選取通路後，進行篩選
 * @param option - 選取的通路 Option
 */
function selectChannel(option: Option) {
  if (option.value == '') {
    displayPurchaseList.value = purchaseList.value
    return
  }
  displayPurchaseList.value = [...purchaseList.value].filter(
    (item) => item.channelName === option.name,
  )
}
</script>

<template>
  <div class="purchase">
    <h3>採購清單</h3>
    <p>請選擇場販場次、通路</p>
    <div class="selectBox">
      <event-select-component @select-option="selectEvent"></event-select-component>
      <shop-select-component
        v-if="isShowChannelSelect"
        :key="currentEventId"
        :event-id="currentEventId.toString()"
        :isShowAll="true"
        @select-option="selectChannel"
      ></shop-select-component>
    </div>
    <purchase-channel-item
      v-for="purchase in displayPurchaseList"
      :key="purchase.channelName"
      :channelName="purchase.channelName"
      :eventId="currentEventId"
      :data="purchase.data"
      :isOperate="!currentEventIsLocked"
      @refresh="fetchPurchaseList"
    ></purchase-channel-item>
  </div>
</template>

<style scoped>
.purchase {
  .selectBox {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    row-gap: 0.25rem;
  }
}
</style>
