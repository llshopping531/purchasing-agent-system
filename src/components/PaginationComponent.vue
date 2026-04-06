<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
  totalElements: number
  size: number
}>()

const emit = defineEmits<{
  (e: 'changePage', page: number): void
  (e: 'changeSize', size: number): void
}>()

const pageSizeOptions = [10, 20, 50, 100]

const visiblePages = computed((): (number | '...')[] => {
  const { page, totalPages } = props
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i)
  }
  const pages: (number | '...')[] = [0]
  if (page > 3) pages.push('...')
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
    pages.push(i)
  }
  if (page < totalPages - 4) pages.push('...')
  pages.push(totalPages - 1)
  return pages
})
</script>

<template>
  <div class="pagination">
    <div class="pagination-info">共 {{ totalElements }} 筆</div>
    <div class="pagination-controls">
      <button class="page-btn" :disabled="page === 0" @click="emit('changePage', page - 1)">‹</button>
      <template v-for="(p, i) in visiblePages" :key="i">
        <span v-if="p === '...'" class="page-ellipsis">…</span>
        <button
          v-else
          class="page-btn"
          :class="{ active: p === page }"
          @click="emit('changePage', p as number)"
        >
          {{ (p as number) + 1 }}
        </button>
      </template>
      <button class="page-btn" :disabled="page >= totalPages - 1" @click="emit('changePage', page + 1)">›</button>
    </div>
    <select
      class="page-size-select"
      :value="size"
      @change="emit('changeSize', Number(($event.target as HTMLSelectElement).value))"
    >
      <option v-for="s in pageSizeOptions" :key="s" :value="s">{{ s }} 筆/頁</option>
    </select>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}
.pagination-info {
  color: #888;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.page-btn {
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.4rem;
  border: 1px solid #d0d0d0;
  background: #fff;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.9rem;
  color: #444;
  transition: background 0.15s;
  &:hover:not(:disabled) {
    background: var(--color-primary-muted);
    border-color: var(--color-primary);
    color: var(--color-primary-dark);
  }
  &.active {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: #fff;
    cursor: default;
  }
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
}
.page-ellipsis {
  padding: 0 0.2rem;
  color: #aaa;
  user-select: none;
}
.page-size-select {
  height: 2rem;
  padding: 0 0.4rem;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  font-size: 0.9rem;
  cursor: pointer;
  background: #fff;
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}
</style>
