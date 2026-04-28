<script setup lang="ts">
/**
 * 通販訂單管理頁面
 * 選取通販活動後顯示訂單列表，並透過 OnlineOrderFormModal 處理新增／編輯／刪除操作
 */
import { onMounted, ref } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { onlineEventApi } from '@/services/api/online/online-events/online-events-api'
import { onlineOrdersApi } from '@/services/api/online/online-orders/online-orders-api'
import type { QueryOnlineOrdersContent } from '@/services/api/online/online-orders/online-orders-api-interfaces'
import type { QueryOnlineEventsContent } from '@/services/api/online/online-events/online-events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { formatTwd } from '@/utils/format'
import OnlineOrderFormModal from './OnlineOrderFormModal.vue'

const orderFormModal = ref<InstanceType<typeof OnlineOrderFormModal>>()

/** 通販活動下拉選項 */
const eventOptions = ref<SelectOption<QueryOnlineEventsContent | null>[]>([
  { name: '請選擇通販活動', value: null },
])
const currentEventId = ref('')
const currentEventIsLocked = ref(true)

/** 訂單列表資料 */
const tableData = ref<QueryOnlineOrdersContent[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const isTableQueried = ref(false)

const headerRow: HeaderRow[] = [
  { name: '客戶名稱', value: 'customerName', sort: 0, width: '120px', mobileSpan: 2 },
  { name: '商品名稱', value: 'productName', sort: 0 },
  { name: '數量', value: 'quantity', sort: 0, width: '70px' },
  { name: '小計（TWD）', value: 'subtotalTwd', sort: 0, width: '120px' },
  { name: '境內運費', value: 'domesticShipping', sort: 0, width: '100px' },
  { name: '國際運費', value: 'internationalShipping', sort: 0, width: '100px' },
  { name: '備註', value: 'note', sort: 0 },
]

onMounted(async () => {
  const res = await onlineEventApi.getOnlineEvents({ size: 1000 })
  eventOptions.value = [
    { name: '請選擇通販活動', value: null },
    ...res.content.map((e) => ({ name: e.name, value: e })),
  ]
})

function selectEvent(option: SelectOption<QueryOnlineEventsContent | null>) {
  if (!option.value) return
  currentEventId.value = option.value.id.toString()
  currentEventIsLocked.value = option.value.isLocked
  currentPage.value = 0
  getOrderList()
}

async function getOrderList() {
  if (!currentEventId.value) return
  const res = await onlineOrdersApi.getOnlineOrders({
    eventId: Number(currentEventId.value),
    page: currentPage.value,
    size: pageSize.value,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
  isTableQueried.value = true
}

function onChangePage(page: number) {
  currentPage.value = page
  getOrderList()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getOrderList()
}
</script>

<template>
  <div class="online-order">
    <h3>通販訂單管理</h3>
    <div class="orderHeader">
      <div class="selectBox">
        <select-component
          label="通販活動"
          :optionList="eventOptions"
          :defaultValue="eventOptions[0]"
          @selectOption="selectEvent"
        />
      </div>
      <div class="btnBox">
        <div
          class="btn"
          v-if="isTableQueried && !currentEventIsLocked"
          @click="orderFormModal?.createOrder()"
        >
          新增
        </div>
      </div>
    </div>

    <table-component
      v-if="isTableQueried"
      :headerRow="headerRow"
      :tableData="tableData"
      :totalPages="totalPages"
      :currentPage="currentPage"
      :totalElements="totalElements"
      :pageSize="pageSize"
      :is-edit="!currentEventIsLocked"
      :is-delete="!currentEventIsLocked"
      @edit="orderFormModal?.editOrder($event)"
      @delete="orderFormModal?.deleteOrder($event)"
      @change-page="onChangePage"
      @change-size="onChangeSize"
    >
      <template #col-subtotalTwd="{ row }">
        {{ formatTwd(row.subtotalTwd) }}
      </template>
      <template #col-domesticShipping="{ row }">
        {{ formatTwd(row.domesticShipping) }}
      </template>
      <template #col-internationalShipping="{ row }">
        {{ formatTwd(row.internationalShipping) }}
      </template>
    </table-component>

    <online-order-form-modal
      ref="orderFormModal"
      :eventId="currentEventId"
      :key="currentEventId"
      @confirmed="getOrderList"
    />
  </div>
</template>

<style scoped>
.online-order {
  .orderHeader {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    .selectBox {
      display: flex;
      gap: 1rem;
    }
    .btnBox {
      display: flex;
      gap: 1rem;
    }
  }
}
</style>
