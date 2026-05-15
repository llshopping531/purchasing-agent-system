<script setup lang="ts">
/**
 * 商品管理頁面
 * 選取活動與通路後顯示分頁商品列表，並透過 ProductFormModal ref 處理新增／編輯／刪除操作
 */
import { onMounted, ref } from 'vue'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import ShopSelectComponent from '@/components/inputs/selects/ShopSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import ProductFormModal from './ProductFormModal.vue'
import BatchProductFormModal from './BatchProductFormModal.vue'
import SocialPostModal from './SocialPostModal.vue'
import ProductImportModal from './ProductImportModal.vue'
import { productsApi } from '@/services/api/offline/products/products-api'
import type { ProductsResBase } from '@/services/api/offline/products/products-api-interfaces'
import { orderApi } from '@/services/api/offline/order/order-api'
import type { SelectOption } from '@/interfaces/common'
import type { EventsResBase } from '@/services/api/offline/events/events-api-interfaces'
import type { QueryChannelsAllRes } from '@/services/api/offline/channels/channels-api-interfaces'
import { useSearchStore } from '@/stores/search'
import { useMenuStore } from '@/stores/menu'
import { formatTwd } from '@/utils/format'

const searchStore = useSearchStore()
const menuStore = useMenuStore()

/** ProductFormModal 的 ref，用於呼叫 editProduct / deleteProduct */
const productFormModalRef = ref<InstanceType<typeof ProductFormModal>>()
/** 是否顯示批次新增彈窗 */
const isShowBatchModal = ref(false)
/** 是否顯示社群貼文彈窗 */
const isShowSocialModal = ref(false)
/** 是否顯示商品匯入彈窗 */
const isShowImportModal = ref(false)

/** 目前選取的活動 ID */
const currentEventId = ref('')
/** 目前選取的活動名稱 */
const currentEventName = ref('')
/** 目前選取的通路 ID */
const currentShopId = ref('')
/** 目前選取的通路名稱 */
const currentChannelName = ref('')
/** 目前選取的通路預設匯率 */
const currentShopExchangeRate = ref<number | undefined>(undefined)
/** 目前選取的通路日幣滿額 */
const currentMinJpy = ref('')
/** 是否已執行過查詢（用於控制表格與新增按鈕的顯示） */
const isTableQueried = ref(false)
/** 是否顯示通路下拉 */
const isShowChannelSelect = ref(false)

/** 表格欄位定義 */
const headerRow: HeaderRow[] = [
  { name: '', value: '_check', sort: -1, width: '44px' },
  { name: '商品名稱', value: 'name', sort: 0, width: '250px', mobileSpan: 2 },
  { name: '日幣定價', value: 'priceJpy', sort: 1, width: '100px', sortable: true },
  { name: '台幣定價', value: 'priceTwd', sort: 2, width: '100px', sortable: true },
  { name: '匯率', value: 'exchangeRate', sort: 3, width: '80px' },
  { name: '盲抽', value: 'isBlindBox', sort: 4, width: '70px' },
  { name: '圖片', value: 'image', sort: 5 },
]

/** 已選取的商品 ID 列表 */
const selectedIds = ref<number[]>([])
/** 批次刪除進行中 */
const isBatchDeleting = ref(false)
/** 是否顯示批次刪除確認彈窗 */
const showBatchConfirm = ref(false)

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value = [...selectedIds.value, id]
  else selectedIds.value = selectedIds.value.filter((v) => v !== id)
}

function toggleSelectAll() {
  if (selectedIds.value.length === tableData.value.length) {
    selectedIds.value = []
  } else {
    selectedIds.value = tableData.value.map((p) => p.id)
  }
}

async function confirmBatchDelete() {
  showBatchConfirm.value = false
  isBatchDeleting.value = true
  await Promise.all(selectedIds.value.map((id) => productsApi.deleteProducts(id)))
  selectedIds.value = []
  isBatchDeleting.value = false
  getProductList()
}

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
/** 商品名稱篩選關鍵字 */
const keyword = ref('')
/** 目前排序欄位 */
const sortField = ref<string | undefined>(undefined)
/** 目前排序方向 */
const sortDirection = ref<'ASC' | 'DESC' | undefined>(undefined)

onMounted(async () => {
  const prev = searchStore.getSearchStore('PRODUCT')
  if (prev?.eventId) {
    currentEventId.value = prev.eventId
    if (prev.channelId) currentShopId.value = prev.channelId
    isShowChannelSelect.value = true
    const [events, channels] = await Promise.all([
      menuStore.fetchEventsAll(),
      prev.channelId ? menuStore.fetchChannelsAll(Number(prev.eventId)) : Promise.resolve([]),
    ])
    const event = events.find((e) => e.id.toString() === prev.eventId)
    if (event) {
      currentEventName.value = event.name
      currentEventIsLocked.value = event.isLocked
    }
    if (prev.channelId) {
      const channel = channels.find((c) => c.id.toString() === prev.channelId)
      if (channel) {
        currentChannelName.value = channel.name
        currentShopExchangeRate.value = channel.exchangeRate
        currentMinJpy.value = channel.thresholdJpy ? channel.thresholdJpy.toLocaleString() : ''
      }
    }
    getProductList()
  }
})

/**
 * 選取活動，重置表格並重新查詢
 * @param data - 選取的活動 Option
 */
function selectEvent(data: SelectOption<EventsResBase | null>) {
  if (!data.value) return
  currentEventId.value = data.value.id.toString()
  currentEventName.value = data.name
  currentEventIsLocked.value = data.value.isLocked
  currentShopId.value = ''
  currentChannelName.value = ''
  isShowChannelSelect.value = true
  searchStore.setSearchStore({
    name: 'PRODUCT',
    condition: { eventId: currentEventId.value, channelId: null },
  })
  resetTable()
}

/**
 * 選取通路，重置表格並重新查詢
 * @param data - 選取的通路 Option
 */
function selectShop(data: SelectOption<QueryChannelsAllRes | null>) {
  currentShopId.value = data.value?.id.toString() ?? ''
  currentChannelName.value = data.name
  currentShopExchangeRate.value = data.value?.exchangeRate ?? 0
  currentMinJpy.value = data.value?.thresholdJpy ? data.value?.thresholdJpy.toLocaleString() : ''
  searchStore.setSearchStore({
    name: 'PRODUCT',
    condition: { eventId: currentEventId.value, channelId: currentShopId.value },
  })
  resetTable()
}

/**
 * 重置頁碼，並在活動已選取時重新查詢
 */
function resetTable() {
  currentPage.value = 0
  tableData.value = []
  if (currentEventId.value) {
    getProductList()
  }
}

/**
 * 依目前活動 ID、通路 ID 及分頁條件查詢商品列表
 * 活動未選取時不發送請求；未選通路則以 getDistinctProducts 查詢全部通路（無分頁）
 */
async function getProductList() {
  if (!currentEventId.value) return
  if (!currentShopId.value) {
    const res = await orderApi.getDistinctProducts(Number(currentEventId.value))
    tableData.value = res
    totalPages.value = 0
    totalElements.value = res.length
    isTableQueried.value = true
    return
  }
  const res = await productsApi.getProducts({
    eventId: Number(currentEventId.value),
    channelId: Number(currentShopId.value),
    page: currentPage.value,
    size: pageSize.value,
    keyword: keyword.value || undefined,
    sort: sortField.value,
    direction: sortDirection.value,
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
  selectedIds.value = []
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

/**
 * 點擊欄位排序
 */
function onSort(field: string, direction: 'ASC' | 'DESC') {
  sortField.value = field
  sortDirection.value = direction
  currentPage.value = 0
  getProductList()
}

/**
 * 商品名稱關鍵字變更
 */
function onKeyword(val: string | number) {
  keyword.value = String(val)
}

/**
 * 確定篩選，重置頁碼並查詢
 */
function onSearch() {
  currentPage.value = 0
  getProductList()
}
</script>

<template>
  <div class="product">
    <h3>商品管理</h3>
    <div class="system-note">1. 如需新增商品請先選擇通路</div>
    <div class="productHeader">
      <div class="selectBox">
        <event-select-component :initialId="currentEventId" @selectOption="selectEvent" />
        <shop-select-component
          v-if="isShowChannelSelect"
          :key="currentEventId"
          :eventId="currentEventId"
          :initialId="currentShopId || undefined"
          :isShowAll="true"
          @selectOption="selectShop"
        />
      </div>
      <div v-if="isTableQueried" class="keyword-bar">
        <text-input label="商品名稱" :value="keyword" @update:value="onKeyword" />
        <div class="btn filter-btn" @click="onSearch">確定</div>
      </div>
      <div class="btnBox">
        <div
          class="btn btn-social"
          v-if="isTableQueried && currentShopId"
          @click="isShowSocialModal = true"
        >
          社群貼文
        </div>
        <!-- <div
          class="btn btn-import"
          v-if="isTableQueried && currentShopId && !currentEventIsLocked"
          @click="isShowImportModal = true"
        >
          匯入
        </div> -->
        <div
          class="btn"
          v-if="isTableQueried && currentShopId && !currentEventIsLocked"
          @click="isShowBatchModal = true"
        >
          新增
        </div>
      </div>
    </div>
    <!-- 批次操作工具列 -->
    <div v-if="isTableQueried && !currentEventIsLocked" class="batch-bar">
      <button class="btn btn-select-all" @click="toggleSelectAll">
        {{ selectedIds.length === tableData.length && tableData.length > 0 ? '取消全選' : '全選本頁' }}
      </button>
      <template v-if="selectedIds.length">
        <span class="batch-count">已選取 {{ selectedIds.length }} 筆</span>
        <button class="btn btn-batch-delete" :disabled="isBatchDeleting" @click="showBatchConfirm = true">
          {{ isBatchDeleting ? '刪除中…' : '批次刪除' }}
        </button>
      </template>
    </div>

    <table-component
      v-if="isTableQueried"
      :headerRow="headerRow"
      :tableData="tableData"
      :is-delete="!currentEventIsLocked"
      :is-edit="!currentEventIsLocked"
      :sortField="sortField"
      :sortDirection="sortDirection"
      @sort="onSort"
      @edit="productFormModalRef?.editProduct($event)"
      @delete="productFormModalRef?.deleteProduct($event)"
    >
      <template #col-_check="{ row }">
        <input
          v-if="!currentEventIsLocked"
          type="checkbox"
          class="row-checkbox"
          :checked="selectedIds.includes(row.id)"
          @change="toggleSelect(row.id)"
        />
      </template>
      <template #col-priceTwd="{ row }">
        <span>
          <span
            v-if="!row.priceTwd || String(row.priceTwd) === '-'"
            class="warn-icon"
            title="台幣定價為空"
            >!</span
          >
          {{ formatTwd(row.priceTwd) }}
        </span>
      </template>
      <template #col-isBlindBox="{ row }">
        <span v-if="row.isBlindBox" class="blind-badge">盲抽</span>
        <span v-else class="noImage">－</span>
      </template>
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
    <batch-product-form-modal
      v-if="isShowBatchModal"
      :eventId="currentEventId"
      :shopId="currentShopId"
      :defaultExchangeRate="currentShopExchangeRate"
      @confirmed="getProductList"
      @close="isShowBatchModal = false"
    />
    <product-form-modal
      ref="productFormModalRef"
      :eventId="currentEventId"
      :shopId="currentShopId"
      @confirmed="getProductList"
    />
    <confirm-modal-component
      v-if="showBatchConfirm"
      name="批次刪除"
      :confirmText="`確定要刪除已選取的 ${selectedIds.length} 筆商品？`"
      :isDelete="true"
      @confirm="confirmBatchDelete"
      @cancel="showBatchConfirm = false"
    />
    <product-import-modal
      v-if="isShowImportModal"
      :eventId="currentEventId"
      @confirmed="getProductList"
      @close="isShowImportModal = false"
    />
    <social-post-modal
      v-if="isShowSocialModal"
      :eventId="currentEventId"
      :eventName="currentEventName"
      :shopId="currentShopId"
      :channelName="currentChannelName"
      :minJpy="currentMinJpy"
      @close="isShowSocialModal = false"
    />
  </div>
</template>

<style scoped>
.warn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #d97706;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
  margin-right: 0.25rem;
}
.product {
  .selectBox {
    display: flex;
    gap: 1rem;
    row-gap: 0.25rem;
  }
  .keyword-bar {
    display: flex;
    gap: 0.5rem;
    align-items: flex-end;
    .filter-btn {
      white-space: nowrap;
    }
  }
  .system-note {
    width: 100%;
    background: #ffffff;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #d8d4f7;
    margin: 1rem 0;
    font-size: 0.9rem;
  }
  .productHeader {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 1rem;

    .btnBox {
      display: flex;
      gap: 0.75rem;
    }
    .btn-import {
      background: color-mix(in srgb, var(--color-primary) 75%, transparent);
      &:hover {
        background: var(--color-primary);
      }
    }
    .btn-social {
      background: color-mix(in srgb, var(--color-secondary-dark) 90%, transparent);
      &:hover {
        background: var(--color-secondary-dark);
      }
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
  .row-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--color-primary);
  }

  .batch-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;

    .batch-count {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .btn-select-all {
      font-size: 0.8rem;
      padding: 0.2rem 0.75rem;
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color: var(--color-primary);
      border: 1.5px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
      border-radius: var(--radius-xl);
      box-shadow: none;
      &:hover {
        background: color-mix(in srgb, var(--color-primary) 20%, transparent);
      }
    }

    .btn-batch-delete {
      font-size: 0.8rem;
      padding: 0.2rem 0.75rem;
      background: var(--color-danger);
      box-shadow: none;
      border-radius: var(--radius-xl);
      &:hover:not(:disabled) {
        background: var(--color-danger-dark);
      }
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  .blind-badge {
    display: inline-block;
    padding: 0.1rem 0.45rem;
    border-radius: var(--radius-xl);
    font-size: 0.75rem;
    font-weight: 600;
    background: color-mix(in srgb, var(--color-secondary) 15%, transparent);
    color: var(--color-secondary-dark);
  }
}
</style>
