<script setup lang="ts">
/**
 * 採購清單頁面
 * 選取活動後，顯示各通路的採購統計（依通路分組，可個別收合）
 */
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import type { SelectOption } from '@/interfaces/common'
import type { QueryChannelsAllRes } from '@/services/api/channels/channels-api-interfaces'
import { onMounted, ref } from 'vue'
import PurchaseChannelItem from './PurchaseChannelItem.vue'
import type { PurchaseListData } from '@/services/api/purchase/purchase-api-interface'
import { purchaseListApi } from '@/services/api/purchase/purchase-api'
import ShopSelectComponent from '@/components/inputs/selects/ShopSelectComponent.vue'
import PurchaserSelectComponent from '@/components/inputs/selects/PurchaserSelectComponent.vue'
import type { EventsResBase } from '@/services/api/events/events-api-interfaces'
import { useSearchStore } from '@/stores/search'
import { useMenuStore } from '@/stores/menu'

/** 單一通路的採購統計資料結構 */
interface PurchaseList {
  /** 通路名稱 */
  channelName: string
  /** 該通路的採購明細 */
  data: PurchaseListData[]
}
const searchStore = useSearchStore()
const menuStore = useMenuStore()

/** 當前活動 ID */
const currentEventId = ref(0)
/** 篩選的採購者 */
const purchaser = ref<string | undefined>(undefined)

function selectPurchaser(value: string | undefined) {
  purchaser.value = value
  if (currentEventId.value) fetchPurchaseList()
}
/** 依通路整理後的採購清單 */
const purchaseList = ref<PurchaseList[]>([])
/** 顯示用採購清單 */
const displayPurchaseList = ref<PurchaseList[]>([])
/** 是否顯示通路下拉 */
const isShowChannelSelect = ref<boolean>(false)
/** 當前通路是否已鎖定 */
const currentEventIsLocked = ref(true)
/** 當前選取的通路篩選條件 */
const currentChannelFilter = ref<SelectOption<QueryChannelsAllRes | null> | null>(null)

/**
 * 選取活動後，從 API 取得採購統計並轉換為以通路為單位的陣列
 * @param option - 選取的活動 Option
 */
async function fetchPurchaseList() {
  const res = await purchaseListApi.getPurchaseListsAll(currentEventId.value, purchaser.value)
  purchaseList.value = Object.keys(res).map((key) => ({
    channelName: key,
    data: res[key] ?? [],
  }))
  applyChannelFilter()
}

function applyChannelFilter() {
  const filter = currentChannelFilter.value
  if (!filter || filter.value === null) {
    displayPurchaseList.value = purchaseList.value
  } else {
    displayPurchaseList.value = purchaseList.value.filter(
      (item) => item.channelName === filter.name,
    )
  }
}

onMounted(async () => {
  const prev = searchStore.getSearchStore('PURCHASE_LIST')
  if (prev?.eventId) {
    currentEventId.value = Number(prev.eventId)
    isShowChannelSelect.value = true
    const events = await menuStore.fetchEventsAll()
    const matched = events.find((e) => e.id.toString() === prev.eventId)
    if (matched) currentEventIsLocked.value = matched.isLocked
    await fetchPurchaseList()

    // 還原通路篩選條件
    if (prev.channelId) {
      const channels = await menuStore.fetchChannelsAll(currentEventId.value)
      const channel = channels.find((c) => c.id.toString() === prev.channelId)
      if (channel) {
        currentChannelFilter.value = { name: channel.name, value: channel }
        applyChannelFilter()
      }
    }
  }
})

async function selectEvent(data: SelectOption<EventsResBase | null>) {
  if (!data.value) return
  currentEventId.value = data.value.id
  currentEventIsLocked.value = data.value.isLocked
  currentChannelFilter.value = null
  searchStore.setSearchStore({
    name: 'PURCHASE_LIST',
    condition: { eventId: currentEventId.value.toString(), channelId: null },
  })
  await fetchPurchaseList()
  isShowChannelSelect.value = true
}

/**
 * 選取通路後，進行篩選
 * @param option - 選取的通路 Option
 */
function selectChannel(option: SelectOption<QueryChannelsAllRes | null>) {
  currentChannelFilter.value = option
  searchStore.setSearchStore({
    name: 'PURCHASE_LIST',
    condition: {
      eventId: currentEventId.value.toString(),
      channelId: option.value?.id.toString() ?? null,
    },
  })
  applyChannelFilter()
}
</script>

<template>
  <div class="purchase">
    <h3>採購清單</h3>
    <div class="selectBox">
      <event-select-component
        :initialId="currentEventId.toString()"
        @select-option="selectEvent"
      ></event-select-component>
      <shop-select-component
        v-if="isShowChannelSelect"
        :key="currentEventId"
        :event-id="currentEventId.toString()"
        :initialId="searchStore.getSearchStore('PURCHASE_LIST')?.channelId ?? undefined"
        :isShowAll="true"
        @select-option="selectChannel"
      ></shop-select-component>
      <purchaser-select-component
        v-if="isShowChannelSelect"
        :isDisplayAll="true"
        @selectOption="selectPurchaser($event.value)"
      />
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
    row-gap: 0.25rem;
  }
}
</style>
