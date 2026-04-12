<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { PATH } from '@/router/route-constant'
import { useUiStore } from '@/stores/ui'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconReceipt from '@/components/icons/IconReceipt.vue'
import IconBox from '@/components/icons/IconBox.vue'
import IconCalendarDays from '@/components/icons/IconCalendarDays.vue'
import IconUsers from '@/components/icons/IconUsers.vue'
import IconListCheck from '@/components/icons/IconListCheck.vue'
import IconCartShopping from '@/components/icons/IconCartShopping.vue'
import IconFlag from '@/components/icons/IconFlag.vue'
import IconHouse from '@/components/icons/IconHouse.vue'
import IconChartSimple from '@/components/icons/IconChartSimple.vue'

const isCollapsed = ref(false)
const uiStore = useUiStore()
const router = useRouter()

const orderItem = { name: '訂單管理', path: PATH.offlineOrder }
const productItem = { name: '商品管理', path: PATH.offlineProduct }
const eventItem = { name: '活動管理', path: PATH.offlineEvent }
const customerItem = { name: '顧客管理', path: PATH.offlineCustomer }
const purchaseListItem = { name: '採購清單', path: PATH.offlinePurchaseList }
const customerOrdersItem = { name: '個人購物清單', path: PATH.offlineCustomerOrders }
const channelItem = { name: '通路管理', path: PATH.offlineChannel }
const statsItem = { name: '訂單總覽', path: PATH.offlineStats }

router.afterEach(() => {
  uiStore.closeSidebar()
})
</script>

<template>
  <div class="offline-layout">
    <!-- 手機版遮罩 -->
    <transition name="fade">
      <div v-if="uiStore.isSidebarOpen" class="mobile-backdrop" @click="uiStore.closeSidebar()" />
    </transition>

    <!-- 側選單 -->
    <aside class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': uiStore.isSidebarOpen }">
      <!-- 桌面版收合按鈕 (FA6 chevron-left) -->
      <button
        class="toggle-btn"
        @click="isCollapsed = !isCollapsed"
        :title="isCollapsed ? '展開選單' : '收合選單'"
      >
        <icon-chevron-left class="toggle-icon" />
      </button>

      <!-- 區域切換器（頂層） -->
      <div class="zone-switcher">
        <div class="zone-label">切換區域</div>
        <div class="zone-tabs">
          <router-link to="/admin/online" class="zone-tab" title="通販專區">
            <icon-house class="zone-icon" />
            <span class="zone-tab-name">通販專區</span>
          </router-link>
          <router-link to="/admin/offline" class="zone-tab" title="場販專區">
            <icon-flag class="zone-icon" />
            <span class="zone-tab-name">場販專區</span>
          </router-link>
        </div>
      </div>

      <nav class="sidebar-nav">
        <!-- 後台管理 -->
        <div class="nav-group">
          <div class="nav-group-label">後台管理</div>

          <!-- 訂單管理 (FA6 receipt) -->
          <router-link :to="orderItem.path" class="nav-item" :title="isCollapsed ? orderItem.name : ''">
            <icon-receipt class="nav-icon" />
            <span class="nav-item-name">{{ orderItem.name }}</span>
          </router-link>

          <!-- 商品管理 (FA6 box) -->
          <router-link :to="productItem.path" class="nav-item" :title="isCollapsed ? productItem.name : ''">
            <icon-box class="nav-icon" />
            <span class="nav-item-name">{{ productItem.name }}</span>
          </router-link>

          <!-- 通路管理 (FA6 flag) -->
          <router-link :to="channelItem.path" class="nav-item" :title="isCollapsed ? channelItem.name : ''">
            <icon-flag class="nav-icon" />
            <span class="nav-item-name">{{ channelItem.name }}</span>
          </router-link>

          <!-- 活動管理 (FA6 calendar-days) -->
          <router-link :to="eventItem.path" class="nav-item" :title="isCollapsed ? eventItem.name : ''">
            <icon-calendar-days class="nav-icon" />
            <span class="nav-item-name">{{ eventItem.name }}</span>
          </router-link>

          <!-- 顧客管理 (FA6 users) -->
          <router-link :to="customerItem.path" class="nav-item" :title="isCollapsed ? customerItem.name : ''">
            <icon-users class="nav-icon" />
            <span class="nav-item-name">{{ customerItem.name }}</span>
          </router-link>

          <!-- 訂單總覽 (FA6 chart-simple) -->
          <router-link :to="statsItem.path" class="nav-item" :title="isCollapsed ? statsItem.name : ''">
            <icon-chart-simple class="nav-icon" />
            <span class="nav-item-name">{{ statsItem.name }}</span>
          </router-link>
        </div>

        <!-- 採購者管理 -->
        <div class="nav-group">
          <div class="nav-group-label">採購者管理</div>

          <!-- 採購清單 (FA6 list-check) -->
          <router-link :to="purchaseListItem.path" class="nav-item" :title="isCollapsed ? purchaseListItem.name : ''">
            <icon-list-check class="nav-icon" />
            <span class="nav-item-name">{{ purchaseListItem.name }}</span>
          </router-link>

          <!-- 個人購物清單 (FA6 cart-shopping) -->
          <router-link :to="customerOrdersItem.path" class="nav-item" :title="isCollapsed ? customerOrdersItem.name : ''">
            <icon-cart-shopping class="nav-icon" />
            <span class="nav-item-name">{{ customerOrdersItem.name }}</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- 主內容區 -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style scoped>
.offline-layout {
  display: flex;
  min-height: calc(100vh - 100px);
}

/* ── 側選單（桌面） ── */
.sidebar {
  width: 180px;
  min-width: 180px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  position: relative;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 52px;
  min-width: 52px;
}

/* 桌面版收合按鈕 */
.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
  position: absolute;
  top: 14px;
  right: -13px;
  z-index: 5;

  &:hover {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
  }
}

.toggle-icon {
  width: 10px;
  height: 10px;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.sidebar.collapsed .toggle-icon {
  transform: rotate(180deg);
}

/* ── 區域切換器 ── */
.zone-switcher {
  padding: 2.5rem 10px 12px;
  border-bottom: 1.5px solid var(--color-border);
  background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
  flex-shrink: 0;
  overflow: hidden;
}

.zone-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 0 4px;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .zone-label {
  opacity: 0;
}

.zone-tabs {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.zone-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.4rem 8px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  overflow: hidden;
  border: 1.5px solid transparent;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary-dark);
  }

  &.router-link-active {
    background: color-mix(in srgb, var(--color-primary) 14%, transparent);
    color: var(--color-primary-dark);
    font-weight: 700;
    border-color: color-mix(in srgb, var(--color-primary) 35%, transparent);
  }
}

.zone-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.zone-tab-name {
  opacity: 1;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .zone-tab-name {
  opacity: 0;
}

/* ── 導覽 icon ── */
.nav-icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

/* ── 導覽選項 ── */
.sidebar-nav {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow: hidden;
}

.nav-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-group-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.06em;
  padding: 0 14px 4px;
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .nav-group-label {
  opacity: 0;
}

.nav-item {
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

.nav-item-name {
  transition: opacity 0.2s ease;
  opacity: 1;
}

.sidebar.collapsed .nav-item-name {
  opacity: 0;
}

.sidebar.collapsed .zone-switcher {
  padding: 2.5rem 6px 10px;
}

.sidebar.collapsed .zone-tab {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

/* ── 主內容 ── */
.main-content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
  min-width: 0;
}

/* 手機版選單按鈕：桌面隱藏 */
.mobile-menu-btn {
  display: none;
}

/* ── 手機版 ── */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100dvh;
    width: 220px;
    min-width: 220px;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: none;
    padding-top: env(safe-area-inset-top);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: var(--shadow-lg);
  }

  .toggle-btn {
    display: none;
  }

  .sidebar .nav-group-label {
    opacity: 1 !important;
  }

  .sidebar .nav-item-name {
    opacity: 1 !important;
  }

  .sidebar .zone-label {
    opacity: 1 !important;
  }

  .sidebar .zone-tab-name {
    opacity: 1 !important;
  }

  .zone-switcher {
    padding-top: 1.25rem;
  }

  .sidebar-nav {
    padding-top: 0.5rem;
  }

  /* 手機版選單按鈕顯示 */
  .mobile-menu-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 1rem;
    padding: 0.35rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    svg {
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
    }
  }

  .main-content {
    padding: 1rem;
  }

  /* 遮罩 */
  .mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 199;
  }
}

/* ── 遮罩動畫 ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
