<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import TableComponent, { type HeaderRow } from './TableComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import { fieldDefsApi } from '@/services/api/sys/field-defs-api'
import { orderApi, type OrderAllContent } from '@/services/api/order-api'
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
  { name: '更多資訊', value: 'more', sort: 0, width: '100px' }
])
const tableData = ref<OrderAllContent[]>([])
const selectedOrder = ref<OrderAllContent | null>(null)
const isShowDetailModal = ref(false)
const extraFields = ref<{ name: string; value: string }[]>([])

function openDetail(data: OrderAllContent) {
  selectedOrder.value = data
  isShowDetailModal.value = true
}

onMounted(() => {
  getFieldDefsApi()
})

defineExpose({ refresh: getOrderList })

watch(() => [pop.currentEventId, pop.currentShopId], getOrderList)

function deleteData(data: OrderAllContent) {
  emit('delete', data)
}
function editData(data: OrderAllContent) {
  emit('edit', data)
}

async function getFieldDefsApi() {
  const req = {
    entityType: 'ORDER',
  }
  const res = await fieldDefsApi.getfieldDefs(req)
  extraFields.value = res.content.map((item) => ({ name: item.fieldLabel, value: item.fieldKey }))
}
async function getOrderList() {
  if (pop.currentEventId !== '' && pop.currentShopId !== '') {
    const req = {
      eventId: Number(pop.currentEventId),
      channelId: Number(pop.currentShopId),
    }
    const res = await orderApi.getOrders(req)
    tableData.value = res.content
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
  </div>

  <modal-component
    v-if="isShowDetailModal && selectedOrder"
    name="訂單詳細資料"
    width="600px"
    @confirm="isShowDetailModal = false"
    @cancel="isShowDetailModal = false"
  >
    <template #content>
      <div class="detail-grid">
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">購買者</span>
            <span class="detail-value">{{ selectedOrder.customerName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">品項</span>
            <span class="detail-value">{{ selectedOrder.productName }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">數量</span>
            <span class="detail-value">{{ selectedOrder.quantity }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">訂單狀態</span>
            <span class="detail-value">{{ selectedOrder.orderStatusName }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">日幣單價</span>
            <span class="detail-value">{{ selectedOrder.productPriceJpy }} JPY</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">台幣單價</span>
            <span class="detail-value">{{ selectedOrder.productPriceTwd }} TWD</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">匯率</span>
            <span class="detail-value">{{ selectedOrder.exchangeRate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">小計 (日幣)</span>
            <span class="detail-value">{{ selectedOrder.subtotalJpy }} JPY</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">小計 (台幣)</span>
            <span class="detail-value">{{ selectedOrder.subtotalTwd }} TWD</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">採購者</span>
            <span class="detail-value">{{ selectedOrder.purchaserName }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">通路</span>
            <span class="detail-value">{{ selectedOrder.channelName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">採購批次</span>
            <span class="detail-value">{{ selectedOrder.purchaseBatch }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">前台備註</span>
            <span class="detail-value">{{ selectedOrder.publicNote }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">後台備註</span>
            <span class="detail-value">{{ selectedOrder.adminNote }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">非特典對象</span>
            <span class="detail-value">{{ selectedOrder.nonBonusTarget ? '是' : '否' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">固定匯率</span>
            <span class="detail-value">{{ selectedOrder.isFixedRate ? '是' : '否' }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">非砍單對象</span>
            <span class="detail-value">{{ selectedOrder.nonCutTarget ? '是' : '否' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">採購確認</span>
            <span class="detail-value">{{ selectedOrder.purchaseConfirm ? '是' : '否' }}</span>
          </div>
        </div>
        <template v-for="(_, i) in Math.ceil(extraFields.length / 2)" :key="i">
          <div class="detail-line">
            <div class="detail-row" v-for="field in extraFields.slice(i * 2, i * 2 + 2)" :key="field.value">
              <span class="detail-label">{{ field.name }}</span>
              <span class="detail-value">{{ (selectedOrder as any)[field.value] }}</span>
            </div>
          </div>
        </template>
      </div>
    </template>
  </modal-component>
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
    border: 2px solid #8cbfa4;
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
      color: #8cbfa4;
      line-height: 1;
    }
  }
  &:hover .detail-icon {
    border-color: #5a9e80;
    &::before {
      color: #5a9e80;
    }
  }
}
.detail-grid {
  padding: 1rem 0.5rem;
  .detail-line {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }
  .detail-row {
    flex: 1;
    display: flex;
    gap: 0.25rem;
    font-size: 14px;
    .detail-label {
      width: 90px;
      flex-shrink: 0;
      background-color: #8cbfa4;
      color: #fff;
      padding: 0.25rem 0.5rem;
      text-align: center;
    }
    .detail-value {
      flex: 1;
      background-color: #fff;
      padding: 0.25rem 0.5rem;
    }
  }
}
</style>
