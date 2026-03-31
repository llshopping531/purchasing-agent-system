<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import TableComponent, { type HeaderRow } from './TableComponent.vue'
import { fieldDefsApi } from '@/services/api/sys/field-defs-api'
import { orderApi, type OrderAllContent } from '@/services/api/order-api'
const pop = defineProps<{
  currentEventId: string
  currentShopId: string
}>()
const emit = defineEmits<{
  (e: "tableData", data: OrderAllContent[]): void;
}>();

const headerRow = ref<HeaderRow[]>([
  { name: '購買者', value: 'customerName', sort: 0, width: '150px' },
  { name: '品相', value: 'productName', sort: 0, width: '300px' },
  { name: '數量', value: 'quantity', sort: 0, width: '70px' },
  { name: '日幣單價', value: 'productPriceJpy', sort: 0, width: '100px' },
  { name: '匯率', value: 'exchangeRate', sort: 0, width: '70px' },
  { name: '台幣單價', value: 'productPriceTwd', sort: 0, width: '100px' },
  { name: '訂單狀態', value: 'orderStatusName', sort: 0, width: '100px' },
  // { name: '前台備註', value: 'publicNote', sort: 0 },
  // { name: '後台備註', value: 'adminNote', sort: 0 },
])
const tableData = ref<OrderAllContent[]>([])

onMounted(() => {
  getFieldDefsApi()
})

watch(() => [pop.currentEventId, pop.currentShopId], getOrderList)

function deleteData(data: OrderAllContent) {
  console.log(`delete${JSON.stringify(data)}`)
}
function editData(data: OrderAllContent) {
  console.log(`edit${JSON.stringify(data)}`)
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
  if (pop.currentEventId !== '' && pop.currentShopId !== '') {
    const req = {
      eventId: Number(pop.currentEventId),
      channelId: Number(pop.currentShopId),
    }
    tableData.value = await (await orderApi.getOrders(req)).content
    emit("tableData",tableData.value)
  }
}
</script>
<template>
  <div class="orderTable">
    <TableComponent
      :headerRow="headerRow"
      :tableData="tableData"
      :operate="{ isDelete: true, isEdit: true, isOperate: true }"
      @delete="deleteData"
      @edit="editData"
    ></TableComponent>
  </div>
</template>
<style scoped></style>
