<script setup lang="ts">
/**
 * 後台共用側選單
 * - 桌面版可收合
 * - 頂部顯示當前所在專區，點擊展開切換其他專區
 * - nav 內容由父層透過 slot 提供
 */
import { ref, computed, markRaw, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconHouse from '@/components/icons/IconHouse.vue'
import IconFlag from '@/components/icons/IconFlag.vue'
import IconChartSimple from '@/components/icons/IconChartSimple.vue'

interface Zone {
  name: string
  path: string
  icon: Component
}

const ZONES: Zone[] = [
  { name: '通販專區', path: '/admin/online', icon: markRaw(IconHouse) },
  { name: '場販專區', path: '/admin/offline', icon: markRaw(IconFlag) },
  { name: '系統專區', path: '/admin/system', icon: markRaw(IconChartSimple) },
]

const route = useRoute()
const uiStore = useUiStore()

const isCollapsed = ref(false)
const isZoneOpen = ref(false)

const currentZone = computed(() => ZONES.find((z) => route.path.startsWith(z.path)) ?? ZONES[0])

const otherZones = computed(() => ZONES.filter((z) => z.path !== currentZone.value?.path))
</script>

<template>
  <!-- 手機版遮罩 -->
  <transition name="fade">
    <div v-if="uiStore.isSidebarOpen" class="mobile-backdrop" @click="uiStore.closeSidebar()" />
  </transition>

  <aside class="sidebar" :class="{ collapsed: isCollapsed, 'mobile-open': uiStore.isSidebarOpen }">
    <!-- 桌面版收合按鈕 -->
    <button
      class="toggle-btn"
      @click="isCollapsed = !isCollapsed"
      :title="isCollapsed ? '展開選單' : '收合選單'"
    >
      <icon-chevron-left class="toggle-icon" />
    </button>

    <!-- 區域切換器：顯示當前專區，點擊展開切換 -->
    <div class="zone-switcher" v-if="currentZone">
      <button class="zone-current" @click="isZoneOpen = !isZoneOpen" :title="currentZone.name">
        <component :is="currentZone.icon" class="zone-icon" />
        <span class="zone-current-name"  v-if="!isCollapsed">{{ currentZone.name }}</span>
        <span class="zone-arrow" :class="{ open: isZoneOpen }"  v-if="!isCollapsed">▾</span>
      </button>

      <transition name="zone-slide">
        <div v-show="isZoneOpen" class="zone-tabs">
          <router-link
            v-for="zone in otherZones"
            :key="zone.path"
            :to="zone.path"
            class="zone-tab"
            :title="zone.name"
            @click="isZoneOpen = false"
          >
            <component :is="zone.icon" class="zone-icon" />
            <span class="zone-tab-name">{{ zone.name }}</span>
          </router-link>
        </div>
      </transition>
    </div>

    <!-- nav 由各專區頁面提供 -->
    <nav class="sidebar-nav">
      <slot :is-collapsed="isCollapsed" />
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 180px;
  min-width: 180px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition:
    width 0.25s ease,
    min-width 0.25s ease;
  position: relative;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 52px;
  min-width: 52px;
}

/* ── 收合按鈕 ── */
.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition:
    background 0.15s,
    color 0.15s,
    border-color 0.15s;
  position: absolute;
  top: 4px;
  right: 10px;
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
  padding: 3rem 10px 8px;
  border-bottom: 1.5px solid var(--color-border);
  background: color-mix(in srgb, var(--color-primary) 4%, var(--color-surface));
  flex-shrink: 0;
  overflow: hidden;
}

/* 當前專區按鈕 */
.zone-current {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0.4rem 6px;
  border: 1px solid;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary-dark);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  transition: background 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
}

.sidebar.collapsed .zone-current {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.zone-current-name {
  flex: 1;
  text-align: left;
  opacity: 1;
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .zone-current-name {
  opacity: 0;
  width: 0;
}

.zone-arrow {
  font-size: 0.7rem;
  flex-shrink: 0;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;

  &.open {
    transform: rotate(180deg);
  }
}

.sidebar.collapsed .zone-arrow {
  opacity: 0;
  width: 0;
}

/* 其他專區清單 */
.zone-tabs {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.zone-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0.35rem 6px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 500;
  transition:
    background 0.15s,
    color 0.15s;
  white-space: nowrap;
  overflow: hidden;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary-dark);
  }
}

.sidebar.collapsed .zone-tab {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
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
  width: 0;
}

/* ── sidebar-nav slot ── */
.sidebar-nav {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow: hidden;
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

  .zone-current-name,
  .zone-arrow,
  .zone-tab-name {
    opacity: 1 !important;
    width: auto !important;
  }

  .zone-switcher {
    padding-top: 1.25rem;
  }

  .sidebar-nav {
    padding-top: 0.5rem;
  }

  .mobile-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 199;
  }
}

/* ── 動畫 ── */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.zone-slide-enter-active,
.zone-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.zone-slide-enter-from,
.zone-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
