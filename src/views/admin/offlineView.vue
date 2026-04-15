<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PATH } from '@/constants/route.constant'
import { useUiStore } from '@/stores/ui'
import SidebarComponent from '@/components/SidebarComponent.vue'
import IconReceipt from '@/components/icons/IconReceipt.vue'
import IconBox from '@/components/icons/IconBox.vue'
import IconCalendarDays from '@/components/icons/IconCalendarDays.vue'
import IconUsers from '@/components/icons/IconUsers.vue'
import IconListCheck from '@/components/icons/IconListCheck.vue'
import IconCartShopping from '@/components/icons/IconCartShopping.vue'
import IconFlag from '@/components/icons/IconFlag.vue'
import IconChartSimple from '@/components/icons/IconChartSimple.vue'
import IconMoneyBill from '@/components/icons/IconMoneyBill.vue'

const uiStore = useUiStore()
const router = useRouter()

const orderItem        = { name: '訂單管理',   path: PATH.offlineOrder }
const productItem      = { name: '商品管理',   path: PATH.offlineProduct }
const eventItem        = { name: '活動管理',   path: PATH.offlineEvent }
const customerItem     = { name: '顧客管理',   path: PATH.offlineCustomer }
const purchaseListItem = { name: '採購清單',   path: PATH.offlinePurchaseList }
const customerOrdersItem = { name: '個人購物清單', path: PATH.offlineCustomerOrders }
const channelItem      = { name: '通路管理',   path: PATH.offlineChannel }
const statsItem        = { name: '訂單總覽',   path: PATH.offlineStats }
const profitShareItem  = { name: '分潤查詢',   path: PATH.offlineProfitShare }

router.afterEach(() => {
  uiStore.closeSidebar()
})
</script>

<template>
  <div class="layout">
    <sidebar-component>
      <template #default="{ isCollapsed }">
        <!-- 後台管理 -->
        <div class="nav-group">
          <div class="nav-group-label">後<span v-if="!isCollapsed">台管理</span></div>
          <router-link :to="orderItem.path" class="nav-item">
            <icon-receipt class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ orderItem.name }}</span>
          </router-link>
          <router-link :to="productItem.path" class="nav-item" :title="isCollapsed ? productItem.name : ''">
            <icon-box class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ productItem.name }}</span>
          </router-link>
          <router-link :to="channelItem.path" class="nav-item" :title="isCollapsed ? channelItem.name : ''">
            <icon-flag class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ channelItem.name }}</span>
          </router-link>
          <router-link :to="eventItem.path" class="nav-item" >
            <icon-calendar-days class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ eventItem.name }}</span>
          </router-link>
          <router-link :to="customerItem.path" class="nav-item">
            <icon-users class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ customerItem.name }}</span>
          </router-link>
          <router-link :to="statsItem.path" class="nav-item" >
            <icon-chart-simple class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ statsItem.name }}</span>
          </router-link>
          <router-link :to="profitShareItem.path" class="nav-item">
            <icon-money-bill class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ profitShareItem.name }}</span>
          </router-link>
        </div>

        <!-- 採購者管理 -->
        <div class="nav-group">
          <div class="nav-group-label">採<span v-if="!isCollapsed">購者管理</span></div>
          <router-link :to="purchaseListItem.path" class="nav-item">
            <icon-list-check class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ purchaseListItem.name }}</span>
          </router-link>
          <router-link :to="customerOrdersItem.path" class="nav-item">
            <icon-cart-shopping class="nav-icon" /><span class="nav-item-name" v-if="!isCollapsed">{{ customerOrdersItem.name }}</span>
          </router-link>
        </div>
      </template>
    </sidebar-component>

    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: calc(100vh - 100px);
}

.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
  min-width: 0;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}

/* nav 樣式（slot 內容需在此定義，scoped 會透過 :deep 或直接宣告） */
:deep(.nav-group) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

:deep(.nav-group-label) {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.06em;
  padding: 0 14px 4px;
  white-space: nowrap;
  overflow: hidden;
}

:deep(.nav-icon) {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

:deep(.nav-item) {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
    color: var(--color-secondary-dark);
  }

  &.router-link-active {
    background: color-mix(in srgb, var(--color-secondary) 18%, transparent);
    color: var(--color-secondary-dark);
    font-weight: 600;
    border-right: 2.5px solid var(--color-secondary);
  }
}

:deep(.nav-item-name) {
  transition: opacity 0.2s ease;
}
</style>
