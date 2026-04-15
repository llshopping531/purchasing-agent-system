<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { THREADS_ACCESS_TOKEN } from '@/constants/threads.constant'
import { threadsApi } from '@/services/api/threads/threads-api'
import type { ThreadsItem } from '@/services/api/threads/threads-api-interfaces'
import TableComponent from '@/components/tables/TableComponent.vue'
import type { HeaderRow } from '@/components/tables/TableComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'

type ViewState = 'posts' | 'replies'

const HEADER_BASE: HeaderRow[] = [
  { name: 'ID',     value: 'id',        sort: 1, width: '180px' },
  { name: '用戶名稱', value: 'username',  sort: 2, width: '130px' },
  { name: '內容',   value: 'text',       sort: 3 },
  { name: '媒體連結', value: 'media_url', sort: 4, width: '90px' },
  { name: '貼文連結', value: 'permalink', sort: 5, width: '90px' },
]

const HEADER_POSTS: HeaderRow[] = [
  ...HEADER_BASE,
  { name: '', value: '_action', sort: 6, width: '100px' },
]

const accessToken = ref(THREADS_ACCESS_TOKEN)
const viewState = ref<ViewState>('posts')
const activePostId = ref('')

const posts = ref<ThreadsItem[]>([])
const replies = ref<ThreadsItem[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

// 兌換長期 Token
const showExchange = ref(false)
const appSecret = ref('')
const isExchanging = ref(false)
const exchangeResult = ref('')
const exchangeError = ref('')
const exchangeExpiresIn = ref(0)

async function exchangeToken() {
  if (!appSecret.value.trim()) return
  isExchanging.value = true
  exchangeResult.value = ''
  exchangeError.value = ''

  try {
    const res = await threadsApi.exchangeLongLivedToken(accessToken.value, appSecret.value.trim())
    exchangeResult.value = res.access_token
    exchangeExpiresIn.value = res.expires_in
    accessToken.value = res.access_token
  } catch (err: unknown) {
    exchangeError.value = err instanceof Error ? err.message : '兌換失敗'
  } finally {
    isExchanging.value = false
  }
}

async function copyToken() {
  await navigator.clipboard.writeText(exchangeResult.value)
}


const usernameFilter = ref('')
const currentPage = ref(0)
const pageSize = ref(20)

const currentItems = computed(() => (viewState.value === 'posts' ? posts.value : replies.value))

const filteredItems = computed(() => {
  const keyword = usernameFilter.value.trim().toLowerCase()
  if (!keyword) return currentItems.value
  return currentItems.value.filter((item) => item.username.toLowerCase().includes(keyword))
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))

const pagedItems = computed(() => {
  const start = currentPage.value * pageSize.value
  return filteredItems.value.slice(start, start + pageSize.value)
})

const headerRow = computed(() => (viewState.value === 'posts' ? HEADER_POSTS : HEADER_BASE))

const uniqueUsernames = computed(() => [...new Set(replies.value.map((r) => r.username))])
const showUsernameModal = ref(false)
const usernamesText = computed(() => uniqueUsernames.value.join('\n'))

function copyAllUsernames() {
  navigator.clipboard.writeText(usernamesText.value)
}

watch(usernameFilter, () => { currentPage.value = 0 })

watch(viewState, () => {
  usernameFilter.value = ''
  currentPage.value = 0
  errorMessage.value = ''
})

async function fetchPosts() {
  isLoading.value = true
  errorMessage.value = ''
  posts.value = []

  try {
    posts.value = await threadsApi.getThreads(accessToken.value)
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : '發生未知錯誤'
  } finally {
    isLoading.value = false
  }
}

async function viewReplies(postId: string) {
  activePostId.value = postId
  viewState.value = 'replies'
  isLoading.value = true
  replies.value = []

  try {
    replies.value = await threadsApi.getPostReplies(postId, accessToken.value)
  } catch (err: unknown) {
    errorMessage.value = err instanceof Error ? err.message : '發生未知錯誤'
  } finally {
    isLoading.value = false
  }
}

function backToPosts() {
  viewState.value = 'posts'
}
</script>

<template>
  <div class="threads-page">
    <!-- 標題列 -->
    <div class="page-header">
      <div class="title-row">
        <button v-if="viewState === 'replies'" class="back-btn" @click="backToPosts">← 返回</button>
        <h2 class="page-title">
          {{ viewState === 'posts' ? 'Threads 貼文查詢' : '留言列表' }}
        </h2>
        <span v-if="viewState === 'replies'" class="post-id-badge">{{ activePostId }}</span>
      </div>
    </div>

    <!-- 控制列（查詢貼文時） -->
    <div v-if="viewState === 'posts'" class="control-bar">
      <input v-model="accessToken" type="text" class="token-input" placeholder="Access Token" />
      <button class="fetch-btn" :disabled="isLoading" @click="fetchPosts">
        {{ isLoading ? '查詢中...' : '查詢' }}
      </button>
      <button class="exchange-toggle-btn" @click="showExchange = !showExchange">
        {{ showExchange ? '收起' : '兌換長期 Token' }}
      </button>
    </div>

    <!-- 兌換長期 Token 面板 -->
    <div v-if="viewState === 'posts' && showExchange" class="exchange-panel">
      <div class="exchange-row">
        <input
          v-model="appSecret"
          type="password"
          class="secret-input"
          placeholder="App Secret"
        />
        <button class="fetch-btn" :disabled="isExchanging || !appSecret" @click="exchangeToken">
          {{ isExchanging ? '兌換中...' : '確認兌換' }}
        </button>
      </div>

      <div v-if="exchangeError" class="error-box">{{ exchangeError }}</div>

      <div v-if="exchangeResult" class="exchange-result">
        <span class="exchange-label">長期 Token（已自動填入上方）</span>
        <div class="token-row">
          <code class="token-code">{{ exchangeResult }}</code>
          <button class="copy-btn" @click="copyToken">複製</button>
        </div>
        <span class="expire-hint">
          有效期限：約 {{ Math.floor(exchangeExpiresIn / 86400) }} 天
        </span>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>

    <!-- 載入中 -->
    <div v-if="isLoading" class="loading-box">載入中…</div>

    <!-- 結果區域 -->
    <template v-if="!isLoading && currentItems.length > 0">
      <!-- 篩選列 -->
      <div class="filter-bar">
        <input
          v-model="usernameFilter"
          type="text"
          class="filter-input"
          placeholder="篩選用戶名稱"
        />
        <span class="result-count">{{ filteredItems.length }} / {{ currentItems.length }} 筆</span>
      </div>

      <!-- 顯示留言者按鈕（僅留言模式） -->
      <div v-if="viewState === 'replies'" class="username-panel">
        <button class="username-toggle-btn" @click="showUsernameModal = true">
          顯示留言者（{{ uniqueUsernames.length }} 人）
        </button>
      </div>

      <!-- 留言者彈窗 -->
      <modal-component
        v-if="showUsernameModal"
        name="留言者列表"
        width="480px"
        @confirm="showUsernameModal = false"
        @cancel="showUsernameModal = false"
      >
        <template #content>
          <div class="modal-username-header">
            <span class="modal-username-count">共 {{ uniqueUsernames.length }} 人</span>
            <button class="copy-btn" @click="copyAllUsernames">複製全部</button>
          </div>
          <pre class="username-text">{{ usernamesText }}</pre>
        </template>
      </modal-component>

      <table-component
        :table-data="pagedItems"
        :header-row="headerRow"
        :is-edit="false"
        :is-delete="false"
        :total-pages="totalPages"
        :current-page="currentPage"
        :total-elements="filteredItems.length"
        :page-size="pageSize"
        @change-page="currentPage = $event"
        @change-size="pageSize = $event; currentPage = 0"
      >
        <!-- 媒體連結 -->
        <template #col-media_url="{ row }">
          <a v-if="row.media_url" :href="row.media_url" target="_blank" class="link">檢視</a>
          <span v-else class="empty-cell">—</span>
        </template>

        <!-- 貼文連結 -->
        <template #col-permalink="{ row }">
          <a v-if="row.permalink" :href="row.permalink" target="_blank" class="link">開啟</a>
          <span v-else class="empty-cell">—</span>
        </template>

        <!-- 查看留言（僅貼文模式） -->
        <template #col-_action="{ row }">
          <button class="reply-btn" @click="viewReplies(row.id)">查看留言</button>
        </template>
      </table-component>
    </template>

    <!-- 無資料 -->
    <div v-if="!isLoading && !errorMessage && currentItems.length === 0" class="empty-box">
      尚無資料
    </div>
  </div>
</template>

<style scoped>
.threads-page {
  padding: 1rem 0;
}

.page-header {
  margin-bottom: 1.25rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary, #1a1a1a);
  margin: 0;
}

.back-btn {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface, #fff);
  color: var(--color-text-secondary, #555);
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary, #6366f1) 8%, transparent);
    color: var(--color-primary, #6366f1);
  }
}

.post-id-badge {
  font-size: 0.75rem;
  font-family: monospace;
  color: var(--color-text-muted, #999);
  background: var(--color-surface-alt, #f3f4f6);
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-md, 6px);
}

.control-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.token-input {
  flex: 1;
  min-width: 200px;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  font-size: 0.85rem;
  font-family: monospace;
  background: var(--color-surface, #fff);
  color: var(--color-text-primary, #1a1a1a);
  outline: none;

  &:focus {
    border-color: var(--color-primary, #6366f1);
  }
}

.exchange-toggle-btn {
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface, #fff);
  color: var(--color-text-secondary, #555);
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary, #6366f1) 8%, transparent);
    color: var(--color-primary, #6366f1);
    border-color: var(--color-primary, #6366f1);
  }
}

.exchange-panel {
  margin-bottom: 1.25rem;
  padding: 1rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface-alt, #f9fafb);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.exchange-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.secret-input {
  flex: 1;
  min-width: 200px;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  font-size: 0.875rem;
  background: var(--color-surface, #fff);
  color: var(--color-text-primary, #1a1a1a);
  outline: none;

  &:focus {
    border-color: var(--color-primary, #6366f1);
  }
}

.exchange-result {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.exchange-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary, #555);
}

.token-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.token-code {
  flex: 1;
  font-size: 0.75rem;
  font-family: monospace;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 6px);
  padding: 0.35rem 0.6rem;
  word-break: break-all;
  color: var(--color-text-primary, #1a1a1a);
}

.copy-btn {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface, #fff);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary, #6366f1) 8%, transparent);
    color: var(--color-primary, #6366f1);
  }
}

.expire-hint {
  font-size: 0.78rem;
  color: var(--color-text-muted, #999);
}

.username-panel {
  margin-bottom: 0.75rem;
}

.username-panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.username-toggle-btn {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface, #fff);
  color: var(--color-text-secondary, #555);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary, #6366f1) 8%, transparent);
    color: var(--color-primary, #6366f1);
    border-color: var(--color-primary, #6366f1);
  }
}

.username-text {
  margin: 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface-alt, #f9fafb);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--color-text-primary, #1a1a1a);
  white-space: pre-wrap;
  word-break: break-word;
}

.fetch-btn {
  padding: 0.4rem 1.25rem;
  border: none;
  border-radius: var(--radius-md, 6px);
  background: var(--color-primary, #6366f1);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;

  &:hover:not(:disabled) {
    background: var(--color-primary-dark, #4f46e5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.error-box {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md, 6px);
  background: color-mix(in srgb, var(--color-danger, #ef4444) 10%, transparent);
  color: var(--color-danger, #ef4444);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.loading-box,
.empty-box {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted, #999);
  font-size: 0.9rem;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.filter-input {
  width: 200px;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  font-size: 0.875rem;
  background: var(--color-surface, #fff);
  color: var(--color-text-primary, #1a1a1a);
  outline: none;

  &:focus {
    border-color: var(--color-primary, #6366f1);
  }
}

.result-count {
  font-size: 0.85rem;
  color: var(--color-text-muted, #999);
}

.link {
  font-size: 0.8rem;
  color: var(--color-primary, #6366f1);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.empty-cell {
  color: var(--color-text-muted, #999);
}

.username-panel {
  margin-bottom: 0.75rem;
}

.username-toggle-btn {
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--color-border, #ddd);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface, #fff);
  color: var(--color-text-secondary, #555);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary, #6366f1) 8%, transparent);
    color: var(--color-primary, #6366f1);
    border-color: var(--color-primary, #6366f1);
  }
}

.modal-username-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.modal-username-count {
  font-size: 0.85rem;
  color: var(--color-text-muted, #999);
}

.username-text {
  margin: 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 6px);
  background: var(--color-surface-alt, #f9fafb);
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--color-text-primary, #1a1a1a);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 50vh;
  overflow-y: auto;
}

.reply-btn {
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--color-primary, #6366f1);
  border-radius: var(--radius-md, 6px);
  background: transparent;
  color: var(--color-primary, #6366f1);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: var(--color-primary, #6366f1);
    color: #fff;
  }
}
</style>
