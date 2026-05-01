<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import SidebarComponent from '@/components/SidebarComponent.vue'

const uiStore = useUiStore()
const router = useRouter()

router.afterEach(() => {
  uiStore.closeSidebar()
})
</script>

<template>
  <div class="layout">
    <sidebar-component>
      <template #default></template>
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
    background: color-mix(in srgb, var(--color-primary) 12%, transparent);
    color: var(--color-primary-dark);
  }

  &.router-link-active {
    background: color-mix(in srgb, var(--color-primary) 18%, transparent);
    color: var(--color-primary-dark);
    font-weight: 600;
    border-right: 2.5px solid var(--color-primary);
  }
}

:deep(.nav-item-name) {
  transition: opacity 0.2s ease;
}
</style>
