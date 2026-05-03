<script setup lang="ts">
import { useRouter } from 'vue-router'
import { PATH } from '@/constants/route.constant'
import { useUiStore } from '@/stores/ui'
import SidebarComponent from '@/components/SidebarComponent.vue'
import IconCalendarDays from '@/components/icons/IconCalendarDays.vue'
import IconCartShopping from '@/components/icons/IconCartShopping.vue'
import IconReceipt from '@/components/icons/IconReceipt.vue'
import IconFlag from '@/components/icons/IconFlag.vue'

const uiStore = useUiStore()
const router = useRouter()

const navItems = [
  { name: '活動管理', path: PATH.onlineEvent, icon: IconCalendarDays },
  { name: '商品管理', path: PATH.onlineProduct, icon: IconCartShopping },
  { name: '訂單管理', path: PATH.onlineOrder, icon: IconReceipt },
  { name: '官方訂單', path: PATH.onlineOfficialOrder, icon: IconFlag },
]

router.afterEach(() => {
  uiStore.closeSidebar()
})
</script>

<template>
  <div class="layout">
    <sidebar-component>
      <template #default="{ isCollapsed }">
        <div class="nav-group">
          <div class="nav-group-label">通<span v-if="!isCollapsed">販專區</span></div>
          <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item">
            <component :is="item.icon" class="nav-icon" />
            <span class="nav-item-name" v-if="!isCollapsed">{{ item.name }}</span>
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
