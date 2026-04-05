<script setup lang="ts">
import { ref } from 'vue'
import EventSelectComponent from '@/components/inputs/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/ShopSelectComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import type { Option } from '@/interfaces/common'
import OrderTableComponent from '@/components/tables/OrderTableComponent.vue'
import { orderApi } from '@/services/api/order/order-api'
import type { OrderQueryContent } from '@/services/api/order/order-api-interfaces'
import OrderStatusSelectComponent from '@/components/inputs/OrderStatusSelectComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'

const orderTableRef = ref<InstanceType<typeof OrderTableComponent>>()

const currentEventId = ref<string>('')
const currentShopId = ref<string>('')
const currentOrderId = ref<number>(0)
const isShowTotalBtn = ref<boolean>(false)
const isTableQueried = ref<boolean>(false)
const isShowTotalModal = ref<boolean>(false)
const isShowOrderFormModal = ref<boolean>(false)
// 1新增 2修改 3刪除
const modalMode = ref<1 | 2 | 3>(1)

const formCustomerId = ref<number | null>(null)
const formProductId = ref<number | null>(null)
const formQuantity = ref<number | null>(null)
const formExchangeRate = ref<number | null>(null)
const formSubtotalJpy = ref<number | null>(null)
const formSubtotalTwd = ref<number | null>(null)
const formOrderStatusOption = ref<Option | undefined>(undefined)
const formNote = ref<string>('')
const formNonBonusTarget = ref<boolean>(false)
const formIsFixedRate = ref<boolean>(false)
const formNonCutTarget = ref<boolean>(false)
const formPurchaseConfirm = ref<boolean>(false)
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
        if (!acc[cur.name]) {
          acc[cur.name] = { name: cur.name, value: 0 }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc[cur.name] as any).value += cur.value
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

function editOrder(currentData: OrderQueryContent) {
  modalMode.value = 2
  currentOrderId.value = currentData.id
  formCustomerId.value = currentData.customerId
  formProductId.value = currentData.productId
  formQuantity.value = currentData.quantity
  formExchangeRate.value = currentData.exchangeRate
  formSubtotalJpy.value = currentData.subtotalJpy
  formSubtotalTwd.value = currentData.subtotalTwd
  formOrderStatusOption.value = { value: currentData.orderStatus, name: currentData.orderStatusName }
  formNote.value = currentData.note
  formNonBonusTarget.value = currentData.nonBonusTarget
  formIsFixedRate.value = currentData.isFixedRate
  formNonCutTarget.value = currentData.nonCutTarget
  formPurchaseConfirm.value = currentData.purchaseConfirm
  isShowOrderFormModal.value = true
}

function deleteOrder(currentData: OrderQueryContent) {
  modalMode.value = 3
  currentOrderId.value = currentData.id
  isShowOrderFormModal.value = true
}

async function confirm() {
  const req = {
    eventId: Number(currentEventId.value),
    channelId: Number(currentShopId.value),
    customerId: formCustomerId.value ?? 0,
    productId: formProductId.value ?? 0,
    quantity: formQuantity.value ?? 0,
    exchangeRate: formExchangeRate.value ?? undefined,
    subtotalJpy: formSubtotalJpy.value ?? undefined,
    subtotalTwd: formSubtotalTwd.value ?? undefined,
    orderStatus: formOrderStatusOption.value?.value ?? '',
    note: formNote.value,
    nonBonusTarget: formNonBonusTarget.value,
    isFixedRate: formIsFixedRate.value,
    nonCutTarget: formNonCutTarget.value,
    purchaseConfirm: formPurchaseConfirm.value,
  }
  if (modalMode.value === 1) await orderApi.postOrders(req)
  if (modalMode.value === 2) await orderApi.patchOrders(currentOrderId.value, req)
  if (modalMode.value === 3) await orderApi.deleteOrders(currentOrderId.value)
  closeModal()
  orderTableRef.value?.refresh()
}

function closeModal() {
  currentOrderId.value = 0
  formCustomerId.value = null
  formProductId.value = null
  formQuantity.value = null
  formExchangeRate.value = null
  formSubtotalJpy.value = null
  formSubtotalTwd.value = null
  formOrderStatusOption.value = undefined
  formNote.value = ''
  formNonBonusTarget.value = false
  formIsFixedRate.value = false
  formNonCutTarget.value = false
  formPurchaseConfirm.value = false
  isShowOrderFormModal.value = false
}
</script>

<template>
  <div class="order">
    <h3>訂單管理</h3>
    <p>請選擇場販場次、通路</p>
    <div class="orderHeader">
      <div class="selectBox">
        <event-select-component @selectOption="selectEvent"></event-select-component>
        <shop-select-component
          :eventId="currentEventId"
          @selectOption="selectShop"
        ></shop-select-component>
      </div>
      <div class="btn" v-if="isShowTotalBtn" @click="isShowTotalModal = true">顯示統計</div>
      <div class="btn create" v-if="isTableQueried" @click="createOrder">新增</div>
    </div>
    <order-table-component
      ref="orderTableRef"
      :currentEventId="currentEventId"
      :currentShopId="currentShopId"
      @tableData="getTableData"
      @delete="deleteOrder"
      @edit="editOrder"
    ></order-table-component>
    <router-view></router-view>
    <modal-component name="統計" @confirm="isShowTotalModal = false" v-if="isShowTotalModal">
      <template #content>
        <div class="totalTable">
          <table-component
            :headerRow="headerRow"
            :tableData="tableData"
            :operate="{ isDelete: false, isEdit: false, isOperate: false }"
          >
          </table-component>
        </div>
      </template>
    </modal-component>
    <confirm-modal-component
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
      width="600px"
      @cancel="closeModal"
      @confirm="confirm"
    >
      <template #content>
        <div class="formGrid">
          <text-input v-if="modalMode === 1" label="顧客 ID" v-model:value="formCustomerId" />
          <text-input v-if="modalMode === 1" label="商品 ID" v-model:value="formProductId" />
          <text-input label="數量" v-model:value="formQuantity" />
          <text-input label="匯率" v-model:value="formExchangeRate" />
          <text-input label="小計 (日幣)" v-model:value="formSubtotalJpy" />
          <text-input label="小計 (台幣)" v-model:value="formSubtotalTwd" />
          <order-status-select-component
            :defaultValue="formOrderStatusOption"
            @selectOption="formOrderStatusOption = $event"
          />
          <text-input label="備註" v-model:value="formNote" />
          <div class="checkboxGroup">
            <label><input type="checkbox" v-model="formNonBonusTarget" /> 非特典對象</label>
            <label><input type="checkbox" v-model="formIsFixedRate" /> 固定匯率</label>
            <label><input type="checkbox" v-model="formNonCutTarget" /> 非砍單對象</label>
            <label><input type="checkbox" v-model="formPurchaseConfirm" /> 採購確認</label>
          </div>
        </div>
      </template>
    </confirm-modal-component>
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
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1.5rem;
  padding: 0 0.5rem;
  .checkboxGroup {
    grid-column: span 2;
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      cursor: pointer;
    }
  }
}
</style>
