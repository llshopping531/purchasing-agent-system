<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue'
export interface HeaderRow {
  name: string
  value: string
  sort: number
  width?: string
}
const pop = defineProps<{
  tableData: T[]
  headerRow: HeaderRow[]
  operate: {
    isDelete: boolean
    isEdit: boolean
    isOperate: boolean
  }
}>()
const emit = defineEmits<{
  (e: 'edit', data: T): void
  (e: 'delete', data: T): void
}>()
const sortedHeaderRow = computed(() => [...pop.headerRow].sort((a, b) => a.sort - b.sort))

function editData(data: T) {
  emit('edit', data)
}

function deleteData(data: T) {
  emit('delete', data)
}
</script>

<template>
  <div class="table" :style="{ '--row-count': pop.headerRow.length + 1 }">
    <div class="header">
      <div
        class="header-item"
        :style="{ width: header.width }"
        v-for="header in sortedHeaderRow"
        :key="header.sort"
        :class="header.value"
      >
        {{ header.name }}
      </div>
      <div class="header-item operate" v-if="operate.isOperate">操作</div>
    </div>
    <div class="body">
      <div class="body-item" v-for="(dataRow, index) in pop.tableData" :key="index">
        <div
          class="item-col"
          v-for="header in sortedHeaderRow"
          :key="header.value"
          :style="{ width: header.width }"
          :class="header.value"
        >
          <slot :name="`col-${header.value}`" :row="dataRow">
            {{ dataRow[header.value] }}
          </slot>
        </div>
        <div class="item-col operate" v-if="operate.isOperate">
          <div class="btn edit" v-if="operate.isEdit" @click="editData(dataRow)">編輯</div>
          <div class="btn delete" v-if="operate.isDelete" @click="deleteData(dataRow)">刪除</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table {
  background-color: rgba(124, 111, 224, 0.08);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  .header {
    display: flex;
    gap: 1px;
  }

  .header-item,
  .item-col {
    width: calc(100% / var(--row-count));
  }

  .header-item {
    background-color: var(--color-primary);
    padding: 0.65rem 0.75rem;
    color: #fff;
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.02em;

    &.operate {
      width: 120px;
    }
  }

  .body {
    .body-item {
      display: flex;
      gap: 1px;
      margin-top: 1px;
      transition: filter 0.1s;

      &:nth-child(even) .item-col {
        background-color: #f8f6ff;
      }

      &:hover .item-col {
        background-color: var(--color-primary-muted);
      }
    }
  }

  .item-col {
    background-color: var(--color-surface);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
  }

  .item-col.operate {
    gap: 0.35rem;
    justify-content: center;
    width: 120px;
    flex-wrap: wrap;

    .btn {
      padding: 0.2rem 0.6rem;
      font-size: 0.8rem;
      border-radius: var(--radius-sm);
      box-shadow: none;

      &.delete {
        background-color: var(--color-danger);

        &:hover {
          background-color: var(--color-danger-dark);
        }
      }
    }
  }
}
</style>
