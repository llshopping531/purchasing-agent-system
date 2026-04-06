<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import BooleanTransformComponent from '@/components/BooleanTransformComponent.vue'
import CustomerFormModal from './CustomerFormModal.vue'
import { customersApi } from '@/services/api/customers/customers-api'
import type { CustomersResBase } from '@/services/api/customers/customers-api-interfaces'

const customerFormModalRef = ref<InstanceType<typeof CustomerFormModal>>()

const headerRow: HeaderRow[] = [
  { name: '客戶名稱', value: 'name', sort: 0, width: '180px' },
  { name: '來源', value: 'sourceName', sort: 0, width: '100px' },
  { name: '已私訊官方', value: 'hasMessagedOfficial', sort: 0, width: '100px' },
  { name: '優惠對象', value: 'isDiscount', sort: 0, width: '90px' },
  { name: '老闆', value: 'isBoss', sort: 0, width: '70px' },
  { name: '備註', value: 'note', sort: 0 },
]

const tableData = ref<CustomersResBase[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)

onMounted(() => {
  getCustomerList()
})

async function getCustomerList() {
  const res = await customersApi.getCustomers({
    page: currentPage.value,
    size: pageSize.value,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
}

function onChangePage(page: number) {
  currentPage.value = page
  getCustomerList()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getCustomerList()
}
</script>

<template>
  <div class="customer">
    <div class="header">
      <h3>顧客管理</h3>
      <div class="btn" @click="customerFormModalRef?.createCustomer()">新增</div>
    </div>
    <table-component
      :headerRow="headerRow"
      :tableData="tableData"
      :operate="{ isDelete: false, isEdit: true, isOperate: true }"
      @edit="customerFormModalRef?.editCustomer($event)"
    >
      <template #col-hasMessagedOfficial="{ row }">
        <boolean-transform-component :value="row.hasMessagedOfficial"></boolean-transform-component>
      </template>
      <template #col-isDiscount="{ row }">
        <boolean-transform-component :value="row.isDiscount"></boolean-transform-component>
      </template>
      <template #col-isBoss="{ row }">
        <boolean-transform-component :value="row.isBoss"></boolean-transform-component>
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
    <customer-form-modal ref="customerFormModalRef" @confirmed="getCustomerList" />
  </div>
</template>

<style scoped>
.customer {
  margin-top: 1rem;
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
</style>
