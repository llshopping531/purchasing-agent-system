<script setup lang="ts">
import { onMounted, ref } from 'vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import type { Option } from '@/interfaces/common'
import { eventApi } from '@/services/event-api'
import { channelApi } from '@/services/channel-api'
import OrderTableComponent from '@/components/tables/OrderTableComponent.vue'

const currentEventId = ref<string>('')
const currentShopId = ref<string>('')
const eventList = ref<Option[]>([])
const shopList = ref<Option[]>([])

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
function selectEvent(data: Option) {
  currentEventId.value = data.value
  getChannelList()
}
function selectShop(data: Option) {
  currentShopId.value = data.value
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
    <OrderTableComponent
      :currentEventId="currentEventId"
      :currentShopId="currentShopId"
    ></OrderTableComponent>
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
