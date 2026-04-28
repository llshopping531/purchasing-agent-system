<script setup lang="ts">
/**
 * 通販商品管理頁面
 * 選取通販活動後顯示商品列表，並透過 OnlineProductFormModal 處理新增／編輯／刪除操作
 */
import { onMounted, ref } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { onlineEventApi } from '@/services/api/online/online-events/online-events-api'
import { onlineProductsApi } from '@/services/api/online/online-products/online-products-api'
import type { QueryOnlineProductsContent } from '@/services/api/online/online-products/online-products-api-interfaces'
import type { QueryOnlineEventsContent } from '@/services/api/online/online-events/online-events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { formatTwd } from '@/utils/format'
import OnlineProductFormModal from './OnlineProductFormModal.vue'

const productFormModal = ref<InstanceType<typeof OnlineProductFormModal>>()

/** 通販活動下拉選項 */
const eventOptions = ref<SelectOption<QueryOnlineEventsContent | null>[]>([
  { name: '請選擇通販活動', value: null },
])
/** 目前選取的活動 ID */
const currentEventId = ref('')
/** 目前活動是否已鎖定 */
const currentEventIsLocked = ref(true)

/** 商品列表資料 */
const tableData = ref<QueryOnlineProductsContent[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)
const keyword = ref('')
const isTableQueried = ref(false)

const headerRow: HeaderRow[] = [
  { name: '商品名稱', value: 'name', sort: 0, mobileSpan: 2 },
  { name: '台幣價格', value: 'priceTwd', sort: 0, width: '120px' },
  { name: '重量（kg）', value: 'weight', sort: 0, width: '120px' },
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
  keyword.value = ''
  currentPage.value = 0
  getProductList()
}

async function getProductList() {
  if (!currentEventId.value) return
  const res = await onlineProductsApi.getOnlineProducts({
    eventId: Number(currentEventId.value),
    keyword: keyword.value || undefined,
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
  getProductList()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getProductList()
}

function onSearch() {
  currentPage.value = 0
  getProductList()
}
</script>

<template>
  <div class="online-product">
    <h3>通販商品管理</h3>
    <div class="productHeader">
      <div class="selectBox">
        <select-component
          label="通販活動"
          :optionList="eventOptions"
          :defaultValue="eventOptions[0]"
          @selectOption="selectEvent"
        />
      </div>
      <div v-if="isTableQueried" class="keyword-bar">
        <text-input label="商品名稱" :value="keyword" @update:value="keyword = String($event)" />
        <div class="btn filter-btn" @click="onSearch">確定</div>
      </div>
      <div class="btnBox">
        <div
          class="btn"
          v-if="isTableQueried && !currentEventIsLocked"
          @click="productFormModal?.createProduct()"
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
      @edit="productFormModal?.editProduct($event)"
      @delete="productFormModal?.deleteProduct($event)"
      @change-page="onChangePage"
      @change-size="onChangeSize"
    >
      <template #col-priceTwd="{ row }">
        {{ formatTwd(row.priceTwd) }}
      </template>
    </table-component>

    <online-product-form-modal
      ref="productFormModal"
      :eventId="currentEventId"
      @confirmed="getProductList"
    />
  </div>
</template>

<style scoped>
.online-product {
  .productHeader {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 1rem;
    .selectBox {
      display: flex;
      gap: 1rem;
    }
    .keyword-bar {
      display: flex;
      gap: 0.5rem;
      align-items: flex-end;
      .filter-btn {
        white-space: nowrap;
      }
    }
    .btnBox {
      display: flex;
      gap: 0.75rem;
    }
  }
}
</style>
