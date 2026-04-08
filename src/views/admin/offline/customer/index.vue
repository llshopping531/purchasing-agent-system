<script setup lang="ts">
/**
 * 顧客管理頁面
 * 顯示分頁的顧客列表，並透過 CustomerFormModal ref 處理新增／編輯操作
 */
import { onMounted, ref } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import BooleanTransformComponent from '@/components/BooleanTransformComponent.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'
import CustomerFormModal from './CustomerFormModal.vue'
import { customersApi } from '@/services/api/customers/customers-api'
import type { CustomersResBase } from '@/services/api/customers/customers-api-interfaces'

/** CustomerFormModal 元件的 ref，用於呼叫其 createCustomer / editCustomer */
const customerFormModalRef = ref<InstanceType<typeof CustomerFormModal>>()
/** 是否為快速編輯模式 */
const isQuickEdit = ref(false)

/** 表格欄位定義 */
const headerRow: HeaderRow[] = [
  { name: '客戶名稱', value: 'name', sort: 0, width: '180px' },
  { name: '來源', value: 'sourceName', sort: 0, width: '100px' },
  { name: '已私訊官方', value: 'hasMessagedOfficial', sort: 0, width: '120px' },
  { name: '優惠對象', value: 'isDiscount', sort: 0, width: '90px' },
  { name: '老闆', value: 'isBoss', sort: 0, width: '70px' },
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

onMounted(() => {
  getCustomerList()
})

/**
 * 依目前分頁條件查詢顧客列表
 */
async function getCustomerList() {
  const res = await customersApi.getCustomers({
    page: currentPage.value,
    size: pageSize.value,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
}

/**
 * 換頁
 * @param page - 目標頁碼（0-based）
 */
function onChangePage(page: number) {
  currentPage.value = page
  getCustomerList()
}

/**
 * 更改每頁筆數，並重置至第一頁
 * @param size - 新的每頁筆數
 */
function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getCustomerList()
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
    <div class="header">
      <h3>顧客管理</h3>
      <div class="btn" @click="customerFormModalRef?.createCustomer()">新增</div>
      <div class="btn" @click="isQuickEdit = !isQuickEdit" v-if="!isQuickEdit">快速編輯</div>
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
      @edit="customerFormModalRef?.editCustomer($event)"
      @change-page="onChangePage"
      @change-size="onChangeSize"
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
  .header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    h3 {
      margin: 0;
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
