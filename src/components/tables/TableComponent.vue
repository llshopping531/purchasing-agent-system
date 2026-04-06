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
.table .header,
.table .body-item {
  display: flex;
  gap: 0.25rem;
}
.table {
  .header-item,
  .item-col {
    width: calc(100% / var(--row-count));
  }
  .header-item {
    background-color: var(--color-primary);
    padding: 0.25rem 0.5rem;
    color: #fff;
    text-align: center;
    &.operate {
      width: 120px;
    }
  }
  .item-col {
    background-color: #fff;
    padding: 0.25rem 0.5rem;
  }
  .body-item {
    margin-top: 0.25rem;
    font-size: 14px;
  }
  .item-col.operate {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    width: 120px;
    flex-wrap: wrap;
    justify-content: center;
    .btn {
      padding: 0 0.5rem;
      font-size: 14px;
      &.delete {
        background-color: #e05c5c;
      }
    }
  }
}
</style>
