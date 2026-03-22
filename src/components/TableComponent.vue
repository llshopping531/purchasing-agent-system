<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue'
export interface HeaderRow {
  name: string
  value: string
  sort: number
}
const pop = defineProps<{
  tableData: T[]
  headerRow: HeaderRow[]
  operate: {
    isDelete: boolean
    isEdit: boolean
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
      <div class="header-item" v-for="header in sortedHeaderRow" :key="header.sort">
        {{ header.name }}
      </div>
      <div class="header-item">操作</div>
    </div>
    <div class="body">
      <div class="body-item" v-for="(dataRow, index) in pop.tableData" :key="index">
        <div class="item-col" v-for="header in sortedHeaderRow" :key="header.value">
          {{ dataRow[header.value] }}
        </div>
        <div class="item-col operate">
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
    background-color: #8cbfa4;
    padding: 0.5rem;
    color: #fff;
  }
  .item-col {
    background-color: #fff;
    padding: 0.5rem;
  }
  .body-item {
    margin-top: 0.25rem;
  }
  .operate {
    display: flex;
    gap: 0.25rem;
    align-items: center;
    .btn {
      margin: 0;
      &.delete {
        background-color: #ef6e6e;
      }
    }
  }
}
</style>
