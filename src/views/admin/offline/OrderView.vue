<script setup lang="ts">
import { ref } from 'vue'
import EventSelectComponent from '@/components/inputs/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/ShopSelectComponent.vue'
import type { Option } from '@/interfaces/common'
import OrderTableComponent from '@/components/tables/OrderTableComponent.vue'
import type { OrderAllContent } from '@/services/api/order-api'
import ModalComponent from '@/components/ModalComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'

const currentEventId = ref<string>('')
const currentShopId = ref<string>('')
const isShowTotalBtn = ref<boolean>(false)
const isShowTotalModal = ref<boolean>(false)
const tableData = ref<{ name: string; value: number }[]>([])
const headerRow = ref<HeaderRow[]>([
  { name: '品項', value: 'name', sort: 0, width: '300px' },
  { name: '數量', value: 'value', sort: 0, width: '70px' },
])

function selectEvent(data: Option) {
  currentEventId.value = data.value
}
function selectShop(data: Option) {
  currentShopId.value = data.value
}
function getTableData(data: OrderAllContent[]) {
  if (data.length !== 0) isShowTotalBtn.value = true

  const itemData = data.map((item) => ({ name: item.productName, value: item.quantity }))
  let total = 0
  const result = Object.values(
    itemData.reduce(
      (acc: Record<string, { name: string; value: number }>, cur) => {
        total += cur.value
        if (!acc[cur.name]) {
          acc[cur.name] = { name: cur.name, value: 0 }
        }
        acc[cur.name].value += cur.value
        return acc
      },
      {} as Record<string, { name: string; value: number }>,
    ),
  )
  result.push({ name: '總計', value: total })
  tableData.value = result
}
</script>

<template>
  <div class="order">
    <h3>訂單管理</h3>
    <p>請選擇場販場次、通路</p>
    <div class="orderHeader">
      <div class="selectBox">
        <EventSelectComponent @selectOption="selectEvent"></EventSelectComponent>
        <ShopSelectComponent
          :eventId="currentEventId"
          @selectOption="selectShop"
        ></ShopSelectComponent>
      </div>
      <div class="btn" v-if="isShowTotalBtn" @click="isShowTotalModal = true">顯示統計</div>
    </div>
    <OrderTableComponent
      :currentEventId="currentEventId"
      :currentShopId="currentShopId"
      @tableData="getTableData"
    ></OrderTableComponent>
    <router-view></router-view>
    <ModalComponent
      name="統計"
      @confirm="isShowTotalModal = false"
      v-if="isShowTotalModal"
    >
      <template #content>
        <div class="totalTable">
          <TableComponent
            :headerRow="headerRow"
            :tableData="tableData"
            :operate="{ isDelete: false, isEdit: false, isOperate: false }"
          >
          </TableComponent>
        </div>
      </template>
    </ModalComponent>
  </div>
</template>

<style>
.order {
  margin-top: 1rem;
  .selectBox {
    display: flex;
    gap: 1rem;
    .shopSelect {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      border: 1px solid #8cbfa4;
    }
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
