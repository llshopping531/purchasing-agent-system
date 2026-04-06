<script setup lang="ts">
import PaginationComponent from '@/components/PaginationComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { fieldDefsApi } from '@/services/api/sys/field-defs-api'
import { orderApi, type OrderAllContent } from '@/services/api/order/order-api'
import { onMounted, ref, watch } from 'vue'
import OrderDetailModal from './OrderDetailModal.vue'

const pop = defineProps<{
  currentEventId: string
  currentShopId: string
}>()
const emit = defineEmits<{
  (e: 'tableData', data: OrderAllContent[]): void
  (e: 'delete', data: OrderAllContent): void
  (e: 'edit', data: OrderAllContent): void
}>()

const headerRow = ref<HeaderRow[]>([
  { name: '購買者', value: 'customerName', sort: 0, width: '150px' },
  { name: '品項', value: 'productName', sort: 0, width: '300px' },
  { name: '數量', value: 'quantity', sort: 0, width: '70px' },
  { name: '訂單狀態', value: 'orderStatusName', sort: 0, width: '100px' },
  { name: '更多資訊', value: 'more', sort: 0, width: '100px' },
])
const tableData = ref<OrderAllContent[]>([])
const selectedOrder = ref<OrderAllContent | null>(null)
const isShowDetailModal = ref(false)
const extraFields = ref<{ name: string; value: string }[]>([])

const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)

function openDetail(data: OrderAllContent) {
  selectedOrder.value = data
  isShowDetailModal.value = true
}

onMounted(() => {
  getFieldDefsApi()
})

defineExpose({ refresh: getOrderList })

watch(
  () => [pop.currentEventId, pop.currentShopId],
  () => {
    currentPage.value = 0
    getOrderList()
  },
)

function deleteData(data: OrderAllContent) {
  emit('delete', data)
}
function editData(data: OrderAllContent) {
  emit('edit', data)
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

async function getFieldDefsApi() {
  const res = await fieldDefsApi.getfieldDefs({ entityType: 'ORDER' })
  extraFields.value = res.content.map((item) => ({ name: item.fieldLabel, value: item.fieldKey }))
}

async function getOrderList() {
  if (pop.currentEventId !== '' && pop.currentShopId !== '') {
    const res = await orderApi.getOrders({
      eventId: Number(pop.currentEventId),
      channelId: Number(pop.currentShopId),
      page: currentPage.value,
      size: pageSize.value,
    })
    tableData.value = res.content
    totalPages.value = res.totalPages
    totalElements.value = res.totalElements
    emit('tableData', tableData.value)
  }
}
</script>

<template>
  <div class="orderTable">
    <table-component
      :headerRow="headerRow"
      :tableData="tableData"
      :operate="{ isDelete: true, isEdit: true, isOperate: true }"
      @delete="deleteData"
      @edit="editData"
    >
      <template #col-orderStatusName="{ row }">
        <span :class="{ cancelled: row.orderStatusName === '已取消' }">
          {{ row.orderStatusName }}
        </span>
      </template>
      <template #col-more="{ row }">
        <div class="detail-btn" @click="openDetail(row)">
          <span class="detail-icon"></span>
        </div>
      </template>
    </table-component>
    <pagination-component
      v-if="totalPages > 0"
      :page="currentPage"
      :totalPages="totalPages"
      :totalElements="totalElements"
      :size="pageSize"
      @changePage="onChangePage"
      @changeSize="onChangeSize"
    />
  </div>

  <order-detail-modal
    v-if="isShowDetailModal && selectedOrder"
    :order="selectedOrder"
    :extraFields="extraFields"
    @close="isShowDetailModal = false"
  />
</template>

<style scoped>
.detail-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  .detail-icon {
    display: block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--color-primary);
    border-radius: 50%;
    position: relative;
    &::before {
      content: 'i';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 11px;
      font-style: italic;
      font-weight: bold;
      color: var(--color-primary);
      line-height: 1;
    }
  }
  &:hover .detail-icon {
    border-color: var(--color-primary-dark);
    &::before {
      color: var(--color-primary-dark);
    }
  }
}
</style>
