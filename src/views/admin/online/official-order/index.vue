<script setup lang="ts">
/**
 * 通販官方訂單管理頁面
 * 選取通販活動後顯示官方訂單列表，並透過 OnlineOfficialOrderFormModal 處理新增／編輯／刪除操作
 */
import { onMounted, ref } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { onlineOfficialOrdersApi } from '@/services/api/online/online-official-orders/online-official-orders-api'
import type { QueryOnlineOfficialOrdersContent } from '@/services/api/online/online-official-orders/online-official-orders-api-interfaces'
import type { QueryOnlineEventsContent } from '@/services/api/online/online-events/online-events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { formatTwd } from '@/utils/format'
import { useMenuStore } from '@/stores/menu'
import OnlineOfficialOrderFormModal from './OnlineOfficialOrderFormModal.vue'

const menuStore = useMenuStore()
const formModal = ref<InstanceType<typeof OnlineOfficialOrderFormModal>>()

/** 通販活動下拉選項 */
const eventOptions = ref<SelectOption<QueryOnlineEventsContent | null>[]>([
  { name: '請選擇通販活動', value: null },
])
const currentEventId = ref('')
const currentEventIsLocked = ref(true)

const tableData = ref<QueryOnlineOfficialOrdersContent[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const isTableQueried = ref(false)

const headerRow: HeaderRow[] = [
  { name: '訂單名稱', value: 'name', sort: 0, mobileSpan: 2 },
  { name: '境內運費（總額）', value: 'domesticShippingTotal', sort: 0, width: '150px' },
  { name: '國際運費（總額）', value: 'internationalShippingTotal', sort: 0, width: '150px' },
  { name: '備註', value: 'note', sort: 0 },
]

onMounted(async () => {
  const events = await menuStore.fetchOnlineEventsAll()
  eventOptions.value = [
    { name: '請選擇通販活動', value: null },
    ...events.map((e) => ({ name: e.name, value: e })),
  ]
})

function selectEvent(option: SelectOption<QueryOnlineEventsContent | null>) {
  if (!option.value) return
  currentEventId.value = option.value.id.toString()
  currentEventIsLocked.value = option.value.isLocked
  currentPage.value = 0
  getList()
}

async function getList() {
  if (!currentEventId.value) return
  const res = await onlineOfficialOrdersApi.getOnlineOfficialOrders({
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
  getList()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getList()
}
</script>

<template>
  <div class="online-official-order">
    <h3>官方訂單管理</h3>
    <div class="pageHeader">
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
          @click="formModal?.createOrder()"
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
      @edit="formModal?.editOrder($event)"
      @delete="formModal?.deleteOrder($event)"
      @change-page="onChangePage"
      @change-size="onChangeSize"
    >
      <template #col-domesticShippingTotal="{ row }">
        {{ formatTwd(row.domesticShippingTotal) }}
      </template>
      <template #col-internationalShippingTotal="{ row }">
        {{ formatTwd(row.internationalShippingTotal) }}
      </template>
    </table-component>

    <online-official-order-form-modal
      ref="formModal"
      :eventId="currentEventId"
      @confirmed="getList"
    />
  </div>
</template>

<style scoped>
.online-official-order {
  .pageHeader {
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
