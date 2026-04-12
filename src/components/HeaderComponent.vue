<script setup lang="ts">
/**
 * 全站共用 Header 元件
 * 顯示 Logo、系統標題、導覽按鈕，以及登入／登出功能
 */
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IconHouse from '@/components/icons/IconHouse.vue'
import IconArrowRightFromBracket from '@/components/icons/IconArrowRightFromBracket.vue'
import IconBars from '@/components/icons/IconBars.vue'

defineProps<{
  /** 系統標題文字 */
  title: string
  /** 導覽按鈕清單（由父層依當前情境提供） */
  buttonList: {
    /** 按鈕顯示文字 */
    name: string
    /** 點擊後跳轉的路由路徑 */
    link: string
  }[]
}>()

const userStore = useUserStore()
const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()

const isLogin = ref(userStore.isLogin)

function toLogin() {
  router.push('/login')
  userStore.setRedirect(route.fullPath)
}

function logout() {
  userStore.logout()
  if (route.fullPath.includes('/user')) {
    router.push('/user')
  } else {
    router.push('/')
  }
}
</script>
<template>
  <header>
    <div class="logo-group">
      <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="36" height="36" />

      <!-- 手機版：漢堡選單 + 功能 icon 按鈕 -->
      <div class="mobile-actions">
        <button class="menu-btn" @click="uiStore.openSidebar()" title="開啟選單">
          <icon-bars />
        </button>

        <div class="divider"></div>

        <template v-if="isLogin">
          <router-link to="/user" class="action-btn frontend" title="前往前台">
            <icon-house />
            <span>前台</span>
          </router-link>
          <a class="action-btn logout" @click="logout()" title="登出">
            <icon-arrow-right-from-bracket />
            <span>登出</span>
          </a>
        </template>
        <a v-else class="action-btn frontend" @click="toLogin()" title="登入">
          <icon-house />
          <span>登入</span>
        </a>
      </div>
    </div>

    <div class="title">{{ title }}</div>

    <!-- 桌面版按鈕 -->
    <nav class="desktop-nav">
      <a @click="toLogin()" v-if="!isLogin" class="action-btn frontend" title="登入">
        <icon-house />
        <span>登入</span>
      </a>
      <router-link v-for="(btn, index) in buttonList" :to="btn.link" :key="index" class="action-btn frontend">
        <icon-house />
        <span>{{ btn.name }}</span>
      </router-link>
      <a @click="logout()" v-if="isLogin" class="action-btn logout" title="登出">
        <icon-arrow-right-from-bracket />
        <span>登出</span>
      </a>
    </nav>
  </header>
</template>
<style>
header {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.5rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--color-border);
  gap: 0.75rem;
  width: 100vw;
}

.logo-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* 手機版功能區塊（桌面隱藏） */
.mobile-actions {
  display: none;
  align-items: center;
  gap: 0.4rem;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    background: var(--color-primary-muted);
    color: var(--color-primary);
  }
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--color-border);
  margin: 0 0.1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-xl);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;

  svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  &.frontend {
    border: 1.5px solid var(--color-primary);
    color: var(--color-primary);
    background: var(--color-primary-muted);

    &:hover {
      background: var(--color-primary);
      color: #fff;
    }
  }

  &.logout {
    border: 1.5px solid var(--color-danger);
    color: var(--color-danger);
    background: rgba(224, 92, 92, 0.08);

    &:hover {
      background: var(--color-danger);
      color: #fff;
    }
  }
}

header .title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  letter-spacing: 0.04em;
  margin-left: 0.25rem;
}

.desktop-nav {
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

@media (max-width: 768px) {
  header {
    padding: 0.5rem 1rem;
  }

  header .title {
    display: none;
  }

  .logo-group {
    width: 100%;
  }

  .mobile-actions {
    display: flex;
    margin-left: auto;
  }

  .desktop-nav {
    display: none;
  }
}
</style>
