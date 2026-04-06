<script setup lang="ts">
import { ref } from 'vue'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/selects/ShopSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import ProductFormModal from './ProductFormModal.vue'
import type { Option } from '@/interfaces/common'
import { productsApi } from '@/services/api/products/products-api'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'

const productFormModalRef = ref<InstanceType<typeof ProductFormModal>>()

const currentEventId = ref('')
const currentShopId = ref('')
const isTableQueried = ref(false)

const headerRow: HeaderRow[] = [
  { name: '商品名稱', value: 'name', sort: 0, width: '250px' },
  { name: '日幣定價', value: 'priceJpy', sort: 0, width: '100px' },
  { name: '台幣定價', value: 'priceTwd', sort: 0, width: '100px' },
  { name: '匯率', value: 'exchangeRate', sort: 0, width: '80px' },
  { name: '圖片', value: 'image', sort: 0 },
]

const tableData = ref<ProductsResBase[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)

function selectEvent(data: Option) {
  currentEventId.value = data.value
  resetTable()
}
function selectShop(data: Option) {
  currentShopId.value = data.value
  resetTable()
}

function resetTable() {
  currentPage.value = 0
  if (currentEventId.value && currentShopId.value) {
    getProductList()
  }
}

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

function onChangePage(page: number) {
  currentPage.value = page
  getProductList()
}

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
        <shop-select-component :eventId="currentEventId" @selectOption="selectShop" />
      </div>
      <div class="btn" v-if="isTableQueried" @click="productFormModalRef?.createProduct()">新增</div>
    </div>
    <table-component
      v-if="isTableQueried"
      :headerRow="headerRow"
      :tableData="tableData"
      :operate="{ isDelete: true, isEdit: true, isOperate: true }"
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
  margin-top: 1rem;
  .selectBox {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .productHeader {
    display: flex;
    gap: 1rem;
    align-items: center;
    .btn {
      margin-top: 1.5rem;
    }
  }
  .imageLink {
    color: #8cbfa4;
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
