<script setup lang="ts">
import EventSelectComponent from '@/components/inputs/EventSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import type { Option } from '@/interfaces/common'
import { purchaseListApi, type AdditionalProp } from '@/services/purchase-api'
import { ref } from 'vue'
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
  console.log('selectEvent')
  const res = await purchaseListApi.getPurchaseListsAll({ eventId: Number(option.value) })
  const keys = Object.keys(res)
  const list: PurchaseList[] = []
  keys.forEach((key) => {
    list.push({ channelName: key, data: res[key] ?? [] })
  })
  purchaseList.value = list
}
</script>
<template>
  <div class="purchase">
    <div class="selectBox">
      <EventSelectComponent @select-option="selectEvent"></EventSelectComponent>
    </div>
    <template v-for="purchase in purchaseList" :key="purchase.channelName">
      <h3>{{ purchase.channelName }}</h3>
      <TableComponent
        :headerRow="headerRow"
        :tableData="purchase.data"
        :operate="{ isDelete: false, isEdit: false }"
      ></TableComponent>
    </template>
  </div>
</template>
<style scoped>
.purchase {
  .selectBox {
    margin-top: 2rem;
  }
  h3 {
    margin-top: 1rem;
  }
}
</style>
