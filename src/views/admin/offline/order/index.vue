<script setup lang="ts">
import { ref } from 'vue'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/selects/ShopSelectComponent.vue'
import OrderTableComponent from '@/components/tables/OrderTableComponent/index.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import OrderFormModal from './OrderFormModal.vue'
import type { Option } from '@/interfaces/common'
import type { OrderQueryContent } from '@/services/api/order/order-api-interfaces'

const orderTableRef = ref<InstanceType<typeof OrderTableComponent>>()
const orderFormModalRef = ref<InstanceType<typeof OrderFormModal>>()

const currentEventId = ref('')
const currentShopId = ref('')
const isTableQueried = ref(false)
const isShowTotalBtn = ref(false)
const isShowTotalModal = ref(false)

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

function getTableData(data: OrderQueryContent[]) {
  isTableQueried.value = true
  if (data.length !== 0) isShowTotalBtn.value = true

  const itemData = data.map((item) => ({ name: item.productName, value: item.quantity }))
  let total = 0
  const result = Object.values(
    itemData.reduce(
      (acc: Record<string, { name: string; value: number }>, cur) => {
        total += cur.value
        if (!acc[cur.name]) acc[cur.name] = { name: cur.name, value: 0 }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(acc[cur.name] as any).value += cur.value
        return acc
      },
      {} as Record<string, { name: string; value: number }>,
    ),
  )
  result.push({ name: '總計', value: total })
  tableData.value = result
}

function onConfirmed() {
  orderTableRef.value?.refresh()
}
</script>

<template>
  <div class="order">
    <h3>訂單管理</h3>
    <p>請選擇場販場次、通路</p>
    <div class="orderHeader">
      <div class="selectBox">
        <event-select-component @selectOption="selectEvent" />
        <shop-select-component :eventId="currentEventId" @selectOption="selectShop" />
      </div>
      <div class="btn" v-if="isShowTotalBtn" @click="isShowTotalModal = true">顯示統計</div>
      <div class="btn create" v-if="isTableQueried" @click="orderFormModalRef?.createOrder()">新增</div>
    </div>
    <order-table-component
      ref="orderTableRef"
      :currentEventId="currentEventId"
      :currentShopId="currentShopId"
      @tableData="getTableData"
      @delete="orderFormModalRef?.deleteOrder($event)"
      @edit="orderFormModalRef?.editOrder($event)"
    />
    <router-view />

    <modal-component name="統計" @confirm="isShowTotalModal = false" v-if="isShowTotalModal">
      <template #content>
        <div class="totalTable">
          <table-component
            :headerRow="headerRow"
            :tableData="tableData"
            :operate="{ isDelete: false, isEdit: false, isOperate: false }"
          />
        </div>
      </template>
    </modal-component>

    <order-form-modal
      ref="orderFormModalRef"
      :eventId="currentEventId"
      :shopId="currentShopId"
      @confirmed="onConfirmed"
    />
  </div>
</template>

<style scoped>
.order {
  margin-top: 1rem;
  .selectBox {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
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
