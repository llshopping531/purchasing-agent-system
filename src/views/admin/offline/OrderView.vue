<script setup lang="ts">
import { ref } from 'vue'
import EventSelectComponent from '@/components/inputs/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/ShopSelectComponent.vue'
import type { Option } from '@/interfaces/common'
import OrderTableComponent from '@/components/tables/OrderTableComponent.vue'
import type { OrderAllContent } from '@/services/api/order-api'
import ModalComponent from '@/components/ModalComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import ConfirmModalCompontent from '@/components/ConfirmModalCompontent.vue'

const currentEventId = ref<string>('')
const currentShopId = ref<string>('')
const currentOrderId = ref<number>(0)
const isShowTotalBtn = ref<boolean>(false)
const isShowTotalModal = ref<boolean>(false)
const isShowOrderFormModal = ref<boolean>(false)
// 1新增 2修改 3刪除
const modalMode = ref<1 | 2 | 3>(1)
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
function createOrder() {
  modalMode.value = 1
  isShowOrderFormModal.value = true
}

function editOrder(currentData: OrderAllContent) {
  modalMode.value = 2
  currentOrderId.value = currentData.id
  isShowOrderFormModal.value = true
}

async function deleteOrder(currentData: OrderAllContent) {
  modalMode.value = 3
  currentOrderId.value = currentData.id
  isShowOrderFormModal.value = true
}

async function confirm() {
  // const eventData = {
  //   name: currentEventName.value,
  //   startDate: currentStartDate.value,
  //   endDate: currentEndDate.value,
  //   isHidden: currentIsHidden.value,
  // }
  // if (modalMode.value === 1) await eventApi.postEvents(eventData)
  // if (modalMode.value === 2) await eventApi.patchEvents(eventData, { id: currentOrderId.value })
  // if (modalMode.value === 3) await eventApi.deleteEvents({ id: currentOrderId.value })
  closeModal()
  // getEventsAll()
}

function closeModal() {
  currentOrderId.value = 0
  isShowOrderFormModal.value = false
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
      <div class="btn create" @click="createOrder">新增</div>
    </div>
    <OrderTableComponent
      :currentEventId="currentEventId"
      :currentShopId="currentShopId"
      @tableData="getTableData"
      @delete="deleteOrder"
      @edit="editOrder"
    ></OrderTableComponent>
    <router-view></router-view>
    <ModalComponent name="統計" @confirm="isShowTotalModal = false" v-if="isShowTotalModal">
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
    <ConfirmModalCompontent
      v-if="isShowOrderFormModal"
      :name="modalMode === 1 ? '新增訂單' : '編輯訂單'"
      :confromText="
        modalMode === 3
          ? `您確定要刪除此訂單嗎？`
          : modalMode === 1
            ? '您確定要新增此訂單嗎？'
            : '您確定要編輯此訂單嗎？'
      "
      :isDelete="modalMode === 3"
      width="500px"
      @cancel="closeModal"
      @confirm="confirm"
    ></ConfirmModalCompontent>
  </div>
</template>

<style>
.order {
  margin-top: 1rem;
  .btn.create {
    margin-left: auto;
  }
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
