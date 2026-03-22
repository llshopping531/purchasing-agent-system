<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import type { Option } from '@/interfaces/common'
import TableComponent, { type HeaderRow } from '@/components/TableComponent.vue'
import { eventApi } from '@/services/event-api'
import { channelApi } from '@/services/channel-api'
import { orderApi, type OrderAllContent } from '@/services/order-api'
import { fieldDefsApi } from '@/services/sys/field-defs-api'

const currentEventId = ref<string>('')
const currentShopId = ref<string>('')
const eventList = ref<Option[]>([])
const shopList = ref<Option[]>([])
const headerRow = ref<HeaderRow[]>([
  { name: '購買者', value: 'customerName', sort: 0,width:'150px' },
  { name: '品相', value: 'productName', sort: 0,width:'300px' },
  { name: '數量', value: 'quantity', sort: 0,width:'70px' },
  { name: '日幣單價', value: 'productPriceJpy', sort: 0,width:'100px' },
  { name: '匯率', value: 'exchangeRate', sort: 0,width:'70px' },
  { name: '台幣單價', value: 'productPriceTwd', sort: 0 ,width:'100px'},
  { name: '訂單狀態', value: 'orderStatusName', sort: 0 ,width:'100px'},
  { name: '前台備註', value: 'publicNote', sort: 0 },
  { name: '後台備註', value: 'adminNote', sort: 0}
])
const tableData = ref<OrderAllContent[]>([])

function deleteData(data: OrderAllContent) {
  console.log(`delete${JSON.stringify(data)}`)
}
function editData(data: OrderAllContent) {
  console.log(`edit${JSON.stringify(data)}`)
}

onMounted(() => {
  getEventList()
})

async function getEventList() {
  const eventsAllRes = await eventApi.getEventsAll()
  if (eventsAllRes.length !== 0) {
    eventList.value = eventsAllRes.map((res) => ({
      name: res.name,
      value: res.id.toString(),
    }))
  }
}
async function getChannelList() {
  const channelAllRes = await channelApi.getChannelsAll(Number(currentEventId.value))
  if (channelAllRes.length !== 0) {
    shopList.value = channelAllRes.map((res) => ({
      name: res.name,
      value: res.id.toString(),
    }))
  }
}
async function getFieldDefsApi() {
  const req = {
    entityType: 'ORDER',
  }
  const otherRow = await (
    await fieldDefsApi.getfieldDefs(req)
  ).content.map((item) => ({ name: item.fieldLabel, value: item.fieldKey, sort: item.sort }))
  headerRow.value.concat(otherRow)
}
async function getOrderList() {
  const req = {
    eventId: Number(currentEventId.value),
    channelId: Number(currentShopId.value),
  }
  tableData.value = await (await orderApi.getOrders(req)).content
}
function selectEvent(data: Option) {
  currentEventId.value = data.value
  getChannelList()
}
function selectShop(data: Option) {
  currentShopId.value = data.value
  getFieldDefsApi()
  getOrderList()
}
</script>

<template>
  <div class="order">
    <h3>訂單管理</h3>
    <p>請選擇場販場次、通路</p>
    <div class="shopList">
      <SelectComponent
        label="場次"
        :defaultValue="{ name: '', value: '' }"
        :optionList="eventList"
        @selectOption="selectEvent"
      ></SelectComponent>
      <SelectComponent
        label="通路"
        :defaultValue="{ name: '', value: '' }"
        :optionList="shopList"
        @selectOption="selectShop"
      ></SelectComponent>
    </div>
    <TableComponent
      :headerRow="headerRow"
      :tableData="tableData"
      :operate="{ isDelete: true, isEdit: true }"
      @delete="deleteData"
      @edit="editData"
    ></TableComponent>
    <router-view></router-view>
  </div>
</template>

<style>
.order {
  margin-top: 1rem;
}
.shopList {
  display: flex;
  gap: 1rem;
  .shopSelect {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 1px solid #8cbfa4;
  }
}

</style>
