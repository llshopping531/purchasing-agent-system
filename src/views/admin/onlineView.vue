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
      <template #default>
        <div class="nav-group">
          <div class="nav-group-label">通販專區</div>
        </div>
      </template>
    </sidebar-component>

    <main class="main-content">
      <router-view>
        <div class="placeholder">通販專區開發中</div>
      </router-view>
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

.placeholder {
  color: var(--color-text-muted);
  font-size: 0.9rem;
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
</style>
