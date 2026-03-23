<script setup lang="ts">
import { ref } from 'vue'
import EventSelectComponent from '@/components/inputs/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/ShopSelectComponent.vue'
import type { Option } from '@/interfaces/common'
import OrderTableComponent from '@/components/tables/OrderTableComponent.vue'

const currentEventId = ref<string>('')
const currentShopId = ref<string>('')

function selectEvent(data: Option) {
  currentEventId.value = data.value
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
      <EventSelectComponent @selectOption="selectEvent"></EventSelectComponent>
      <ShopSelectComponent :eventId="currentEventId" @selectOption="selectShop"></ShopSelectComponent>
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
