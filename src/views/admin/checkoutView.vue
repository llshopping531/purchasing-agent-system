<script setup lang="ts">
import { ref, computed } from 'vue'
import EventSelectComponent from '@/components/inputs/selects/EventSelectComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import CheckoutTable, { type CheckoutRow } from '@/components/tables/CheckoutTable.vue'
import { packingListApi } from '@/services/api/offline/packing-list/packing-list-api'
import type { EventsResBase } from '@/services/api/offline/events/events-api-interfaces'
import type { SelectOption } from '@/interfaces/common'
import { formatTwd } from '@/utils/format'

const selectedEvent = ref<EventsResBase | null>(null)
const customerFilter = ref('')
const tableData = ref<CheckoutRow[]>([])
const isLoading = ref(false)

const filteredTableData = computed(() => {
  if (!customerFilter.value.trim()) return tableData.value
  const keyword = customerFilter.value.trim().toLowerCase()
  return tableData.value.filter((row) => row.customerName.toLowerCase().includes(keyword))
})

const grandTotal = computed(() =>
  tableData.value.reduce((sum, row) => sum + row._totalAmount, 0),
)

async function onEventSelect(data: SelectOption<EventsResBase | null>) {
  if (!data.value) return
  selectedEvent.value = data.value
  isLoading.value = true
  tableData.value = []

  try {
    const eventId = data.value.id
    const customers = await packingListApi.getCustomers({ eventId })

    const rows = await Promise.all(
      customers.map(async (customer) => {
        const orders = await packingListApi.getCustomerOrders({ customerId: customer.id, eventId })

        // 依通路名稱分組
        const channelMap = new Map<string, typeof orders>()
        for (const order of orders) {
          if (!channelMap.has(order.channelName)) channelMap.set(order.channelName, [])
          channelMap.get(order.channelName)!.push(order)
        }

        const eventList = [...channelMap.entries()].map(([channelName, channelOrders]) => ({
          eventName: channelName,
          items: channelOrders.map((o) => ({
            name: o.productName,
            quantity: o.quantity,
            unitPrice: o.unitTwd,
            itemTotal: o.subtotalTwd,
          })),
        }))

        const totalAmount = orders.reduce((sum, o) => sum + o.subtotalTwd, 0)

        const row: CheckoutRow = {
          customerName: customer.name,
          eventList,
          total: formatTwd(totalAmount),
          _totalAmount: totalAmount,
          reconciled: false,
          note: '',
        }
        return row
      }),
    )

    tableData.value = rows.filter((r) => r.eventList.length > 0)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="checkoutView">
    <div class="page-header">
      <h3 class="page-title">結帳單</h3>
      <div v-if="selectedEvent && !isLoading && tableData.length > 0" class="summary">
        <span class="summary-label">共 {{ tableData.length }} 位顧客</span>
        <span class="summary-sep">·</span>
        <span class="summary-total">合計 {{ formatTwd(grandTotal) }}</span>
      </div>
    </div>

    <div class="filter-bar">
      <event-select-component @selectOption="onEventSelect" />
      <text-input label="顧客篩選" placeholder="輸入顧客姓名" v-model:value="customerFilter" />
    </div>

    <div v-if="!selectedEvent" class="empty-state">
      <div class="empty-icon">💳</div>
      <div class="empty-text">請先選取場次以載入結帳單</div>
    </div>

    <div v-else-if="isLoading" class="empty-state">
      <div class="empty-text">載入中…</div>
    </div>

    <div v-else-if="filteredTableData.length === 0" class="empty-state">
      <div class="empty-text">此場次尚無訂單資料</div>
    </div>

    <checkout-table v-else :rows="filteredTableData" />
  </div>
</template>

<style scoped>
.checkoutView {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
}

.summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.summary-sep {
  color: var(--color-text-muted);
}

.summary-total {
  font-weight: 700;
  color: var(--color-primary);
}

.filter-bar {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--color-text-muted);
}

.empty-icon {
  font-size: 2.5rem;
  opacity: 0.4;
}

.empty-text {
  font-size: 0.9rem;
}
</style>
