<script setup lang="ts">
/**
 * 顧客管理頁面
 * 顯示分頁的顧客列表，並透過 CustomerFormModal ref 處理新增／編輯操作
 */
import { onMounted, ref } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import BooleanTransformComponent from '@/components/BooleanTransformComponent.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import CustomerFormModal from './CustomerFormModal.vue'
import { customersApi } from '@/services/api/customers/customers-api'
import type { CustomersResBase } from '@/services/api/customers/customers-api-interfaces'
import { eventApi } from '@/services/api/events/events-api'
import { customerOrdersApi } from '@/services/api/customer-orders/customer-orders-api'
import type { SelectOption } from '@/interfaces/common'

/** CustomerFormModal 元件的 ref，用於呼叫其 createCustomer / editCustomer */
const customerFormModalRef = ref<InstanceType<typeof CustomerFormModal>>()
/** 是否為快速編輯模式 */
const isQuickEdit = ref(false)

/** 活動選項清單（含「全部」選項） */
const eventOptions = ref<SelectOption<number | null>[]>([{ name: '全部', value: null }])
/** 當前篩選的活動 ID（null = 全部） */
const selectedEventId = ref<number | null>(null)

/** 表格欄位定義 */
const headerRow: HeaderRow[] = [
  { name: '客戶名稱', value: 'name', sort: 0, width: '180px' },
  { name: '來源', value: 'sourceName', sort: 0, width: '100px', sortable: true },
  { name: '已私訊官方', value: 'hasMessagedOfficial', sort: 0, width: '120px', sortable: true },
  { name: '優惠對象', value: 'isDiscount', sort: 0, width: '130px', sortable: true },
  { name: '老闆', value: 'isBoss', sort: 0, width: '70px', sortable: true },
  { name: '備註', value: 'note', sort: 0 },
]

/** 當前頁的顧客資料 */
const tableData = ref<CustomersResBase[]>([])
/** 當前頁碼（0-based） */
const currentPage = ref(0)
/** 每頁筆數 */
const pageSize = ref(20)
/** 總頁數 */
const totalPages = ref(0)
/** 總筆數 */
const totalElements = ref(0)
/** 當前排序欄位 */
const sortField = ref('')
/** 當前排序方向 */
const sortDirection = ref<'ASC' | 'DESC'>('ASC')
/** 活動篩選模式下的全量資料（用於 client-side sort/page） */
const allEventCustomers = ref<CustomersResBase[]>([])

onMounted(async () => {
  const events = await eventApi.getEventsAll()
  eventOptions.value = [
    { name: '全部', value: null },
    ...events.map((e) => ({ name: e.name, value: e.id })),
  ]
  getCustomerList()
})

/**
 * 依目前分頁條件查詢顧客列表
 * 若有選擇活動，改呼叫 customerOrdersApi.getCustomers 取得該活動的客戶（client-side sort/page）
 */
async function getCustomerList() {
  if (selectedEventId.value !== null) {
    const res = await customerOrdersApi.getCustomers({ eventId: selectedEventId.value })
    allEventCustomers.value = res as unknown as CustomersResBase[]
    applyClientSortAndPage()
  } else {
    const res = await customersApi.getCustomers({
      page: currentPage.value,
      size: pageSize.value,
      sort: sortField.value || undefined,
      direction: sortField.value ? sortDirection.value : undefined,
    })
    tableData.value = res.content
    totalPages.value = res.totalPages
    totalElements.value = res.totalElements
  }
}

/**
 * 對活動篩選模式的全量資料做 client-side 排序與分頁
 */
function applyClientSortAndPage() {
  const sorted = [...allEventCustomers.value]
  if (sortField.value) {
    sorted.sort((a, b) => {
      const aVal = a[sortField.value as keyof CustomersResBase]
      const bVal = b[sortField.value as keyof CustomersResBase]
      const aComp = typeof aVal === 'boolean' ? (aVal ? 1 : 0) : String(aVal ?? '')
      const bComp = typeof bVal === 'boolean' ? (bVal ? 1 : 0) : String(bVal ?? '')
      if (aComp < bComp) return sortDirection.value === 'ASC' ? -1 : 1
      if (aComp > bComp) return sortDirection.value === 'ASC' ? 1 : -1
      return 0
    })
  }
  totalElements.value = sorted.length
  totalPages.value = Math.ceil(sorted.length / pageSize.value) || 1
  const start = currentPage.value * pageSize.value
  tableData.value = sorted.slice(start, start + pageSize.value)
}

/**
 * 切換活動篩選（value 為 null 表示全部）
 */
function onSelectEvent(option: SelectOption<number | null>) {
  selectedEventId.value = option.value
  currentPage.value = 0
  sortField.value = ''
  getCustomerList()
}

/**
 * 排序欄位切換
 */
function onSort(field: string, direction: 'ASC' | 'DESC') {
  sortField.value = field
  sortDirection.value = direction
  currentPage.value = 0
  if (selectedEventId.value !== null) {
    applyClientSortAndPage()
  } else {
    getCustomerList()
  }
}

/**
 * 換頁
 * @param page - 目標頁碼（0-based）
 */
function onChangePage(page: number) {
  currentPage.value = page
  if (selectedEventId.value !== null) {
    applyClientSortAndPage()
  } else {
    getCustomerList()
  }
}

/**
 * 更改每頁筆數，並重置至第一頁
 * @param size - 新的每頁筆數
 */
function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  if (selectedEventId.value !== null) {
    applyClientSortAndPage()
  } else {
    getCustomerList()
  }
}

/**
 * 快速編輯：更新單一 boolean 欄位
 * @param row - 目標顧客資料
 * @param field - 要更新的欄位名稱
 * @param value - 新值
 */
async function updateCustomerField(
  row: CustomersResBase,
  field: 'hasMessagedOfficial' | 'isDiscount' | 'isBoss',
  value: boolean,
) {
  row[field] = value
  await customersApi.patchCustomers(row.id, {
    name: row.name,
    source: row.source,
    hasMessagedOfficial: row.hasMessagedOfficial,
    isDiscount: row.isDiscount,
    isBoss: row.isBoss,
    note: row.note,
  })
}
</script>

<template>
  <div class="customer">
    <h3>顧客管理</h3>
    <div class="filterBar">
      <div class="selectBox">
        <select-component
          label="活動篩選"
          :optionList="eventOptions"
          :defaultValue="eventOptions[0]"
          @selectOption="onSelectEvent"
        />
      </div>
      <div class="btnBox">
        <div class="btn" @click="customerFormModalRef?.createCustomer()">新增</div>
        <div class="btn" @click="isQuickEdit = !isQuickEdit" v-if="!isQuickEdit">快速編輯</div>
      </div>
    </div>

    <div v-if="isQuickEdit" class="quick-edit-bar">
      <span>快速編輯模式：直接勾選欄位即可儲存</span>
      <div class="btn exit-btn" @click="isQuickEdit = false">結束編輯</div>
    </div>

    <table-component
      :headerRow="headerRow"
      :tableData="tableData"
      :isDelete="false"
      :totalPages="totalPages"
      :currentPage="currentPage"
      :totalElements="totalElements"
      :pageSize="pageSize"
      :sortField="sortField"
      :sortDirection="sortDirection"
      @edit="customerFormModalRef?.editCustomer($event)"
      @change-page="onChangePage"
      @change-size="onChangeSize"
      @sort="onSort"
    >
      <template #col-hasMessagedOfficial="{ row }">
        <checkbox-input
          v-if="isQuickEdit"
          label=""
          :modelValue="row.hasMessagedOfficial"
          @update:modelValue="updateCustomerField(row, 'hasMessagedOfficial', $event as boolean)"
        />
        <boolean-transform-component v-else :value="row.hasMessagedOfficial" />
      </template>
      <template #col-isDiscount="{ row }">
        <checkbox-input
          v-if="isQuickEdit"
          label=""
          :modelValue="row.isDiscount"
          @update:modelValue="updateCustomerField(row, 'isDiscount', $event as boolean)"
        />
        <boolean-transform-component v-else :value="row.isDiscount" />
      </template>
      <template #col-isBoss="{ row }">
        <checkbox-input
          v-if="isQuickEdit"
          label=""
          :modelValue="row.isBoss"
          @update:modelValue="updateCustomerField(row, 'isBoss', $event as boolean)"
        />
        <boolean-transform-component v-else :value="row.isBoss" />
      </template>
    </table-component>
    <customer-form-modal ref="customerFormModalRef" @confirmed="getCustomerList" />
  </div>
</template>

<style scoped>
.customer {
  .filterBar {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 1rem;

    .selectBox {
      display: flex;
      gap: 1rem;
      width: 200px;
    }

    .btnBox {
      display: flex;
      gap: 1rem;
    }
  }
}

.quick-edit-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff5f5;
  border: 1.5px solid var(--color-danger);
  border-radius: var(--radius-md, 8px);
  padding: 0.5rem 1rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-danger);

  .exit-btn {
    background: var(--color-danger);
    color: #fff;
    &:hover {
      opacity: 0.85;
    }
  }
}
</style>
