<script setup lang="ts">
/**
 * 商品管理頁面
 * 選取活動與通路後顯示分頁商品列表，並透過 ProductFormModal ref 處理新增／編輯／刪除操作
 */
import { ref } from 'vue'
import EventSelectComponent, { type EventOption } from '@/components/inputs/selects/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/selects/ShopSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import ProductFormModal from './ProductFormModal.vue'
import type { Option } from '@/interfaces/common'
import { productsApi } from '@/services/api/products/products-api'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'

/** ProductFormModal 的 ref，用於呼叫 createProduct / editProduct / deleteProduct */
const productFormModalRef = ref<InstanceType<typeof ProductFormModal>>()

/** 目前選取的活動 ID */
const currentEventId = ref('')
/** 目前選取的通路 ID */
const currentShopId = ref('')
/** 是否已執行過查詢（用於控制表格與新增按鈕的顯示） */
const isTableQueried = ref(false)
/** 是否顯示通路下拉 */
const isShowChannelSelect = ref(false)

/** 表格欄位定義 */
const headerRow: HeaderRow[] = [
  { name: '商品名稱', value: 'name', sort: 0, width: '250px', mobileSpan: 2 },
  { name: '日幣定價', value: 'priceJpy', sort: 0, width: '100px' },
  { name: '台幣定價', value: 'priceTwd', sort: 0, width: '100px' },
  { name: '匯率', value: 'exchangeRate', sort: 0, width: '80px' },
  { name: '圖片', value: 'image', sort: 0 },
]

/** 當前頁的商品資料 */
const tableData = ref<ProductsResBase[]>([])
/** 當前頁碼（0-based） */
const currentPage = ref(0)
/** 每頁筆數 */
const pageSize = ref(20)
/** 總頁數 */
const totalPages = ref(0)
/** 總筆數 */
const totalElements = ref(0)
/** 當前通路是否已鎖定 */
const currentEventIsLocked = ref(true)

/**
 * 選取活動，重置表格並重新查詢
 * @param data - 選取的活動 Option
 */
function selectEvent(data: EventOption) {
  currentEventId.value = data.selectedData.value
  currentEventIsLocked.value = data.isLocked
  currentShopId.value = ''
  isShowChannelSelect.value = true
  resetTable()
}

/**
 * 選取通路，重置表格並重新查詢
 * @param data - 選取的通路 Option
 */
function selectShop(data: Option) {
  currentShopId.value = data.value
  resetTable()
}

/**
 * 重置頁碼，並在活動與通路都已選取時重新查詢
 */
function resetTable() {
  currentPage.value = 0
  tableData.value =[]
  if (currentEventId.value && currentShopId.value) {
    getProductList()
  }
}

/**
 * 依目前活動 ID、通路 ID 及分頁條件查詢商品列表
 * 活動或通路未選取時不發送請求
 */
async function getProductList() {
  if (!currentEventId.value || !currentShopId.value) return
  const res = await productsApi.getProducts({
    eventId: Number(currentEventId.value),
    channelId: Number(currentShopId.value),
    page: currentPage.value,
    size: pageSize.value,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
  isTableQueried.value = true
}

/**
 * 換頁
 * @param page - 目標頁碼（0-based）
 */
function onChangePage(page: number) {
  currentPage.value = page
  getProductList()
}

/**
 * 更改每頁筆數，並重置至第一頁
 * @param size - 新的每頁筆數
 */
function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getProductList()
}
</script>

<template>
  <div class="product">
    <h3>商品管理</h3>
    <p>請選擇場販場次、通路</p>
    <div class="productHeader">
      <div class="selectBox">
        <event-select-component @selectOption="selectEvent" />
        <shop-select-component
          v-if="isShowChannelSelect"
          :key="currentEventId"
          :eventId="currentEventId"
          @selectOption="selectShop"
        />
      </div>
      <div class="btnBox">
        <div class="btn" v-if="isTableQueried" @click="productFormModalRef?.createProduct()">
          新增
        </div>
      </div>
    </div>
    <table-component
      v-if="isTableQueried"
      :headerRow="headerRow"
      :tableData="tableData"
      :is-delete="!currentEventIsLocked"
      :is-edit="!currentEventIsLocked"
      @edit="productFormModalRef?.editProduct($event)"
      @delete="productFormModalRef?.deleteProduct($event)"
    >
      <template #col-image="{ row }">
        <a v-if="row.image" :href="row.image" target="_blank" class="imageLink">檢視圖片</a>
        <span v-else class="noImage">－</span>
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
    <product-form-modal
      ref="productFormModalRef"
      :eventId="currentEventId"
      :shopId="currentShopId"
      @confirmed="getProductList"
    />
  </div>
</template>

<style scoped>
.product {
  .selectBox {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    row-gap: 0.25rem;
  }
  .productHeader {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 1rem;

    .btnBox {
      display: flex;
      gap: 1rem;
    }
  }
  .imageLink {
    color: var(--color-primary);
    font-size: 0.85rem;
    &:hover {
      text-decoration: underline;
    }
  }
  .noImage {
    color: #bbb;
    font-size: 0.85rem;
  }
}
</style>
