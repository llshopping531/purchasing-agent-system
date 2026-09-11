<script setup lang="ts">
/**
 * 通販國際運費計算 - 列表頁
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { useSecondSupplementStore, type SupplementBill } from '@/stores/secondSupplement'
import { formatTwd } from '@/utils/format'
import { PATH } from '@/constants/route.constant'

const router = useRouter()
const store = useSecondSupplementStore()

const headerRow: HeaderRow[] = [
  { name: '名稱', value: 'name', sort: 0, mobileSpan: 2 },
  { name: '建立時間', value: 'createdAt', sort: 1, width: '150px' },
  { name: '加入活動', value: '_eventNames', sort: 2 },
  { name: '國境運費', value: '_shipping', sort: 3, width: '110px' },
  { name: '每公斤金額', value: '_pricePerKg', sort: 4, width: '110px' },
]

const tableData = computed(() =>
  store.bills.map((b) => ({
    ...b,
    _eventNames: b.eventNames.join('、'),
    _shipping: b.internationalShippingTotal,
    _pricePerKg: b.pricePerKg,
  })),
)

function onEdit(row: SupplementBill) {
  router.push(`${PATH.onlineSecondSupplement}/${row.id}/edit`)
}

function onDelete(row: SupplementBill) {
  store.remove(row.id)
}
</script>

<template>
  <div class="page">
    <h3>國際運費計算</h3>

    <div class="pageHeader">
      <div class="btnBox">
        <div class="btn" @click="router.push(PATH.onlineSecondSupplementNew)">新增</div>
      </div>
    </div>

    <table-component
      :headerRow="headerRow"
      :tableData="tableData"
      :isEdit="true"
      :isDelete="true"
      :rowClass="() => 'clickable-row'"
      @row-click="router.push(`${PATH.onlineSecondSupplement}/${$event.id}`)"
      @edit="onEdit($event)"
      @delete="onDelete($event)"
    >
      <template #col-_shipping="{ row }">
        {{ formatTwd(row._shipping) }}
      </template>
      <template #col-_pricePerKg="{ row }">
        {{ formatTwd(row._pricePerKg) }} / kg
      </template>
    </table-component>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pageHeader {
  .btnBox {
    display: flex;
    gap: 1rem;
  }
}

:deep(.clickable-row) {
  cursor: pointer;

  &:hover .item-col {
    background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
  }
}
</style>
