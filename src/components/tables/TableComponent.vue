<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * 通用表格元件
 * 支援泛型資料列、自訂欄位寬度、slot 覆寫欄位內容，以及編輯／刪除操作欄
 */
import { computed } from 'vue'
import PaginationComponent from '@/components/PaginationComponent.vue'

/** 表頭欄位定義 */
export interface HeaderRow {
  /** 欄位顯示名稱 */
  name: string
  /** 對應資料物件的屬性名稱 */
  value: string
  /** 排序順序（數字越小越靠前） */
  sort: number
  /** 欄位寬度（CSS 值，例如 '200px'） */
  width?: string
  /** 手機版佔幾格（預設 1） */
  mobileSpan?: number
  /** 是否可排序 */
  sortable?: boolean
}

const pop = withDefaults(
  defineProps<{
    /** 表格資料陣列 */
    tableData: T[]
    /** 表頭欄位定義陣列 */
    headerRow: HeaderRow[]
    /** 是否顯示刪除按鈕 */
    isDelete?: boolean
    /** 是否顯示編輯按鈕 */
    isEdit?: boolean
    /** 總頁數 */
    totalPages?: number
    /** 當前頁碼 */
    currentPage?: number
    /** 總筆數 */
    totalElements?: number
    /** 每頁筆數 */
    pageSize?: number
    /** 目前排序欄位 */
    sortField?: string
    /** 目前排序方向 */
    sortDirection?: 'ASC' | 'DESC'
  }>(),
  {
    isDelete: true,
    isEdit: true,
    totalPages: 0,
    currentPage: 1,
    totalElements: 0,
    pageSize: 100,
  },
)
const emit = defineEmits<{
  /** 點擊編輯按鈕時觸發，帶出該列資料 */
  (e: 'edit', data: T): void
  /** 點擊刪除按鈕時觸發，帶出該列資料 */
  (e: 'delete', data: T): void
  /** 使用者切換頁碼時觸發 */
  (e: 'changePage', data: number): void
  /** 使用者變更每頁筆數時觸發 */
  (e: 'changeSize', data: number): void
  /** 點擊可排序欄位時觸發 */
  (e: 'sort', field: string, direction: 'ASC' | 'DESC'): void
}>()

/**
 * 點擊欄位標頭進行排序
 * 若已是當前排序欄位則切換方向，否則預設 ASC
 */
function onSortClick(header: HeaderRow) {
  if (!header.sortable) return
  const direction = pop.sortField === header.value && pop.sortDirection === 'ASC' ? 'DESC' : 'ASC'
  emit('sort', header.value, direction)
}

/** 依 sort 排序後的表頭欄位陣列 */
const sortedHeaderRow = computed(() => [...pop.headerRow].sort((a, b) => a.sort - b.sort))

/**
 * 觸發編輯事件
 * @param data - 該列的完整資料物件
 */
function editData(data: T) {
  emit('edit', data)
}

/**
 * 觸發刪除事件
 * @param data - 該列的完整資料物件
 */
function deleteData(data: T) {
  emit('delete', data)
}

/**
 * 觸發換頁事件
 * @param page - 前往的頁碼
 */
function onChangePage(page: number) {
  emit('changePage', page)
}

/**
 * 觸發調整每頁筆數事件
 * @param pageSize - 調整的每頁筆數
 */
function onChangeSize(pageSize: number) {
  emit('changeSize', pageSize)
}
</script>

<template>
  <div class="table-box">
    <div class="table" :style="{ '--row-count': pop.headerRow.length }">
      <div class="header">
        <div
          class="header-item"
          :style="{ 'min-width': header.width }"
          v-for="header in sortedHeaderRow"
          :key="header.sort"
          :class="[header.value, { sortable: header.sortable }]"
          @click="onSortClick(header)"
        >
          {{ header.name }}
          <span v-if="header.sortable" class="sort-icon">
            <span
              :class="[
                'arrow',
                'asc',
                { active: sortField === header.value && sortDirection === 'ASC' },
              ]"
              >▲</span
            >
            <span
              :class="[
                'arrow',
                'desc',
                { active: sortField === header.value && sortDirection === 'DESC' },
              ]"
              >▼</span
            >
          </span>
        </div>
        <div class="header-item operate" v-if="isDelete || isEdit">操作</div>
      </div>
      <div class="body">
        <div class="body-item" v-for="(dataRow, index) in pop.tableData" :key="index">
          <div
            class="item-col"
            v-for="header in sortedHeaderRow"
            :key="header.value"
            :style="{ '--col-width': header.width, '--mobile-span': header.mobileSpan ?? 1 }"
            :class="header.value"
            :data-label="header.name"
          >
            <slot :name="`col-${header.value}`" :row="dataRow">
              {{ dataRow[header.value] }}
            </slot>
          </div>
          <div
            class="item-col operate"
            v-if="isDelete || isEdit"
            :style="{ '--mobile-span': 3, width: '150px' }"
          >
            <div class="btn edit" v-if="isEdit" @click="editData(dataRow)">編輯</div>
            <div class="btn delete" v-if="isDelete" @click="deleteData(dataRow)">刪除</div>
          </div>
        </div>
      </div>
    </div>
    <pagination-component
      v-if="totalPages > 0"
      :page="currentPage"
      :totalPages="totalPages"
      :totalElements="totalElements"
      :size="pageSize"
      @changePage="onChangePage"
      @changeSize="onChangeSize"
    />
  </div>
</template>

<style scoped>
.table-box {
  width: 100%;
}

.table {
  background-color: rgba(124, 111, 224, 0.08);
  box-shadow: var(--shadow-sm);
  width: 100%;
  border-radius: var(--radius-md);
  .header {
    display: flex;
    gap: 1px;
  }

  .header-item,
  .item-col {
    width: calc(100% / var(--row-count));
    @media (min-width: 769px) {
      min-width: var(--col-width);
    }
  }

  .header-item {
    background-color: var(--color-primary);
    padding: 0.65rem 0.75rem;
    color: #fff;
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    &:first-child {
      border-top-left-radius: var(--radius-md);
    }
    &:last-child {
      border-top-right-radius: var(--radius-md);
    }

    &.sortable {
      cursor: pointer;
      user-select: none;
      &:hover {
        background-color: var(--color-primary-dark);
      }
    }

    .sort-icon {
      display: flex;
      flex-direction: column;
      line-height: 1;
      gap: 1px;

      .arrow {
        font-size: 0.55rem;
        opacity: 0.35;
        &.active {
          opacity: 1;
        }
      }
    }

    &.operate {
      width: 150px;
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

      &:last-child .item-col:first-child {
        border-bottom-left-radius: var(--radius-md);
      }

      &:last-child .item-col:last-child {
        border-bottom-right-radius: var(--radius-md);
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

@media (max-width: 768px) {
  .table-box {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .table {
    background-color: transparent;
    box-shadow: none;
    border-radius: 0;

    .header {
      display: none;
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .body-item {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0;
        margin-top: 0;
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-sm);
        background: #ffffff;
        &:nth-child(even) .item-col {
          background-color: var(--color-surface);
        }

        &:hover .item-col {
          background-color: var(--color-surface);
        }
      }
    }

    .item-col {
      grid-column: span var(--mobile-span, 1);
      width: 100% !important;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 0.55rem 0.75rem;
      border-bottom: 1px solid rgba(124, 111, 224, 0.1);
      font-size: 0.875rem;
      background-color: var(--color-surface);

      &::before {
        content: attr(data-label);
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--color-primary);
        letter-spacing: 0.03em;
        margin-bottom: 0.15rem;
        opacity: 0.85;
      }
    }

    .item-col.operate {
      display: flex;
      flex-direction: row;
      gap: 0;
      &::before {
        display: none;
      }
      .btn {
        width: 50%;
        border-radius: 0;
        padding: 0.25rem;
        &:only-child {
          width: 100%;
        }
      }
    }
  }
}
</style>
