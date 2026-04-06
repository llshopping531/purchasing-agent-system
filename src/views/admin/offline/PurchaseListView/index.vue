<script setup lang="ts">
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import type { HeaderRow } from '@/components/tables/TableComponent.vue'
import type { Option } from '@/interfaces/common'
import { purchaseListApi, type AdditionalProp } from '@/services/api/purchase-api'
import { ref } from 'vue'
import PurchaseChannelItem from './PurchaseChannelItem.vue'

interface PurchaseList {
  channelName: string
  data: AdditionalProp[]
}

const headerRow = ref<HeaderRow[]>([
  { name: '商品名稱', value: 'productName', sort: 0, width: '200px' },
  { name: '應買數量', value: 'shouldBuy', sort: 0, width: '100px' },
  { name: '已買數量', value: 'purchased', sort: 0, width: '100px' },
  { name: '未買數量', value: 'remaining', sort: 0, width: '100px' },
])
const purchaseList = ref<PurchaseList[]>([])

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
