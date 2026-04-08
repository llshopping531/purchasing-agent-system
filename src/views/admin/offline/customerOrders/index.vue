<script setup lang="ts">
/**
 * 個人購物清單查詢頁面
 * 選取活動後顯示有訂單的客戶清單，點選客戶後展開其個人訂單明細
 */
import { ref, computed } from 'vue'
import EventSelectComponent, {
  type EventOption,
} from '@/components/inputs/selects/EventSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { customerOrdersApi } from '@/services/api/customer-orders/customer-orders-api'
import type {
  CustomerOrdersCustomer,
  CustomerOrder,
  ChannelBonus,
} from '@/services/api/customer-orders/customer-orders-api-interfaces'

/** 目前選取的活動 ID */
const currentEventId = ref<number | null>(null)

/** 活動內有訂單的客戶清單 */
const customerList = ref<CustomerOrdersCustomer[]>([])

/** 搜尋關鍵字 */
const searchKeyword = ref('')

/** 目前選取的客戶 */
const selectedCustomer = ref<CustomerOrdersCustomer | null>(null)

/** 選取客戶的個人訂單清單 */
const orderList = ref<CustomerOrder[]>([])

/** 選取客戶的各通路滿額狀態 */
const channelBonusList = ref<ChannelBonus[]>([])

/** 模糊篩選後的客戶清單 */
const filteredCustomerList = computed(() =>
  customerList.value.filter((c) => c.name.includes(searchKeyword.value)),
)

/** 訂單清單表頭 */
const orderHeaderRow: HeaderRow[] = [
  { name: '通路', value: 'channelName', sort: 0, width: '100px' },
  { name: '商品名稱', value: 'productName', sort: 1, width: '250px' },
  { name: '數量', value: 'quantity', sort: 2, width: '70px' },
  { name: '日幣小計', value: 'subtotalJpy', sort: 3, width: '100px' },
  { name: '台幣小計', value: 'subtotalTwd', sort: 4, width: '100px' },
  { name: '訂單狀態', value: 'orderStatusName', sort: 5, width: '100px' },
]

/**
 * 選取活動，重新載入有訂單的客戶清單
 * @param data - 選取的活動 Option
 */
async function selectEvent(data: EventOption) {
  currentEventId.value = Number(data.selectedData.value)
  selectedCustomer.value = null
  orderList.value = []
  searchKeyword.value = ''
  const res = await customerOrdersApi.getCustomers({ eventId: currentEventId.value })
  customerList.value = res
}

/**
 * 選取客戶，載入其個人訂單明細
 * @param customer - 選取的客戶資料
 */
async function selectCustomer(customer: CustomerOrdersCustomer) {
  if (!currentEventId.value) return
  selectedCustomer.value = customer
  const [orders, bonus] = await Promise.all([
    customerOrdersApi.getCustomerOrders({ customerId: customer.id, eventId: currentEventId.value }),
    customerOrdersApi.getChannelBonus({ customerId: customer.id, eventId: currentEventId.value }),
  ])
  orderList.value = orders
  channelBonusList.value = bonus
}
</script>

<template>
  <div class="customer-orders">
    <h3>個人購物清單</h3>
    <p>請選擇活動後，點選客戶查看其購物明細</p>

    <div class="selectBox">
      <event-select-component @selectOption="selectEvent" />
    </div>

    <div v-if="currentEventId" class="content">
      <!-- 客戶清單 -->
      <div class="customer-panel">
        <div class="panel-header">
          <span class="panel-title">客戶清單</span>
          <span class="count">{{ filteredCustomerList.length }} 人</span>
        </div>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜尋客戶名稱..."
        />
        <div v-if="customerList.length === 0" class="empty">此活動尚無訂單資料</div>
        <div v-else-if="filteredCustomerList.length === 0" class="empty">無符合的客戶</div>
        <ul v-else class="customer-list">
          <li
            v-for="customer in filteredCustomerList"
            :key="customer.id"
            class="customer-item"
            :class="{ selected: selectedCustomer?.id === customer.id }"
            @click="selectCustomer(customer)"
          >
            {{ customer.name }}
          </li>
        </ul>
      </div>

      <!-- 訂單明細 -->
      <div class="order-panel">
        <template v-if="selectedCustomer">
          <h4>{{ selectedCustomer.name }} 的訂單明細</h4>

          <!-- 通路滿額狀態 -->
          <div v-if="channelBonusList.length > 0" class="bonus-section">
            <div
              v-for="bonus in channelBonusList"
              :key="bonus.channelName"
              class="bonus-card"
              :class="{ reached: bonus.bonusCount > 0 }"
            >
              <div class="bonus-channel">{{ bonus.channelName }}</div>
              <div class="bonus-progress-wrap">
                <div
                  class="bonus-progress-bar"
                  :style="{ width: Math.min((bonus.totalJpy / bonus.thresholdJpy) * 100, 100) + '%' }"
                />
              </div>
              <div class="bonus-info">
                <span>¥{{ bonus.totalJpy.toLocaleString() }} / ¥{{ bonus.thresholdJpy.toLocaleString() }}</span>
                <span class="bonus-count">已滿額 {{ bonus.bonusCount }} 次</span>
              </div>
              <div class="bonus-remaining">
                還差 ¥{{ ((bonus.bonusCount + 1) * bonus.thresholdJpy - bonus.totalJpy).toLocaleString() }} 達下次滿額
              </div>
            </div>
          </div>

          <div v-if="orderList.length === 0" class="empty">此客戶在本活動無訂單</div>
          <table-component
            v-else
            :headerRow="orderHeaderRow"
            :tableData="orderList"
            :isEdit="false"
            :isDelete="false"
          />
        </template>
        <div v-else class="empty">請點選左側客戶查看訂單明細</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customer-orders {
  .selectBox {
    margin-bottom: 1.5rem;
  }
}

.content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

/* ── 客戶面板 ── */
.customer-panel {
  width: 180px;
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.panel-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.count {
  font-size: 0.75rem;
  color: var(--color-text-muted, #aaa);
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 6px);
  margin-bottom: 0.5rem;
  outline: none;
  background: var(--color-surface);
  transition: border-color 0.15s;

  &:focus {
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-text-muted, #bbb);
  }
}

.customer-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  max-height: 60vh;
  overflow-y: auto;
}

.customer-item {
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.1s, color 0.1s;
  border-bottom: 1px solid var(--color-border);
  line-height: 1.4;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    color: var(--color-primary);
  }

  &.selected {
    background: color-mix(in srgb, var(--color-primary) 14%, transparent);
    color: var(--color-primary);
    font-weight: 600;
    border-left: 3px solid var(--color-primary);
    padding-left: calc(0.75rem - 3px);
  }
}

/* ── 訂單面板 ── */
.order-panel {
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}

.bonus-section {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.bonus-card {
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  padding: 0.6rem 0.875rem;
  min-width: 180px;
  background: var(--color-surface);

  &.reached {
    border-color: var(--color-primary);
    background: color-mix(in srgb, var(--color-primary) 6%, transparent);
  }
}

.bonus-channel {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--color-text-secondary);
}

.bonus-progress-wrap {
  height: 6px;
  background: var(--color-border);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 0.35rem;
}

.bonus-progress-bar {
  height: 100%;
  background: var(--color-primary);
  border-radius: 99px;
  transition: width 0.3s ease;
}

.bonus-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: var(--color-text-muted, #888);
}

.bonus-count {
  font-weight: 600;
  color: var(--color-primary);
}

.bonus-remaining {
  margin-top: 0.3rem;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
  font-weight: 500;
}

.empty {
  color: var(--color-text-muted, #aaa);
  font-size: 0.875rem;
  padding: 1rem 0;
}
</style>
