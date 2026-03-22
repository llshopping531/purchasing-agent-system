<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import type { Option } from '@/interfaces/common'
import TableComponent from '@/components/TableComponent.vue'
import { eventApi } from '@/services/event-api'
import { channelApi } from '@/services/channel-api'
import { orderApi, type OrderAllReq, type OrderAllContent } from '@/services/order-api'

interface TableData {
  col1: string
  col2: string
  col3: string
  col4: string
}
const currentEventId = ref<string>('')
const currentShopId = ref<string>('')
const eventList = ref<Option[]>([])
const shopList = ref<Option[]>([])
const headerRow = [
  { name: '欄位一', value: 'col1', sort: 0 },
  { name: '欄位2', value: 'col2', sort: 3 },
  { name: '欄位3', value: 'col3', sort: 2 },
  { name: '欄位4', value: 'col4', sort: 1 },
]
const tableData = ref<OrderAllContent[]>([])

function deleteData(data: TableData) {
  console.log(`delete${JSON.stringify(data)}`)
}
function editData(data: TableData) {
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
async function getChannelList(eventId: string) {
  const channelAllRes = await channelApi.getChannelsAll(Number(eventId))
  if (channelAllRes.length !== 0) {
    shopList.value = channelAllRes.map((res) => ({
      name: res.name,
      value: res.id.toString(),
    }))
  }
}
async function getOrderList(data: OrderAllReq) {
  tableData.value = await (await orderApi.getOrdersAll(data)).content
}
function selectEvent(data: Option) {
  currentEventId.value = data.value
  getChannelList(data.value)
}
function selectShop(data: Option) {
  currentShopId.value = data.value
  const req = {
    eventId: Number(currentEventId.value),
    channelId: Number(currentShopId.value)
  }
  getOrderList(req)
}
</script>

<template>
  <div class="order">
    <h3>訂單管理</h3>
    <p>請選擇場販場次、通路</p>
    <div class="shopList">
      <SelectComponent
        label="場次"
        :defaultValue="eventList[0]"
        :optionList="eventList"
        @selectOption="selectEvent"
      ></SelectComponent>
      <SelectComponent
        label="通路"
        :defaultValue="shopList[0]"
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
