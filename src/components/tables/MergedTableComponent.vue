<script
  setup
  lang="ts"
  generic="TRow extends Record<string, any>, TGroup extends Record<string, any>, TItem extends Record<string, any>"
>
/**
 * 支援多層合併儲存格的通用表格元件
 *
 * 資料結構為三層：rows → groups → items
 * 欄位透過 columns 定義，每欄指定合併層級：
 *   - 'row'   : 跨該 row 所有品項合併（最外層，如：訂購者）
 *   - 'group' : 跨該 group 所有品項合併（中層，如：團務名）
 *   - 'item'  : 每列獨立，不合併（最內層，如：品項）
 *
 * 預設自動渲染對應層級物件的同名屬性（row[key] / group[key] / item[key]）
 * 只有在內容需要自定義時（不同屬性名、自訂元素等）才需要提供具名 slot
 * slot name 為 column.key，scope 提供 { row, group, item }
 */

/** 欄位合併層級 */
export type MergeLevel = 'row' | 'group' | 'item'

/** 欄位定義 */
export interface ColumnDef {
  /** 唯一識別鍵，同時作為 slot name 及預設取值的屬性名 */
  key: string
  /** 表頭顯示名稱 */
  label: string
  /** 合併層級 */
  level: MergeLevel
  /** 文字對齊方式，預設靠左 */
  align?: 'left' | 'center'
}

const props = defineProps<{
  /** 欄位定義陣列（順序即顯示順序） */
  columns: ColumnDef[]
  /** 最外層資料陣列 */
  rows: TRow[]
  /** 從 row 取得 groups 的 key 名稱 */
  groupsKey: string
  /** 從 group 取得 items 的 key 名稱 */
  itemsKey: string
}>()

function getGroups(row: TRow): TGroup[] {
  return (row[props.groupsKey] as TGroup[]) ?? []
}

function getItems(group: TGroup): TItem[] {
  return (group[props.itemsKey] as TItem[]) ?? []
}

/** 計算一個 row 底下所有品項總數，用於 row 層級的 rowspan */
function totalItemCount(row: TRow): number {
  return getGroups(row).reduce((sum, g) => sum + getItems(g).length, 0)
}
</script>

<template>
  <div class="table-wrapper">
    <table class="merged-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
        </tr>
      </thead>

      <tbody v-if="rows.length > 0">
        <template v-for="(row, rowIndex) in rows" :key="rowIndex">
          <template v-for="(group, groupIndex) in getGroups(row)" :key="groupIndex">
            <tr v-for="(item, itemIndex) in getItems(group)" :key="itemIndex">
              <template v-for="col in columns" :key="col.key">

                <!-- row 層級：只在 groupIndex=0 && itemIndex=0 時渲染，rowspan 為所有品項總數 -->
                <td
                  v-if="col.level === 'row' && groupIndex === 0 && itemIndex === 0"
                  :rowspan="totalItemCount(row)"
                  :class="['merged', { center: col.align === 'center' }]"
                >
                  <slot :name="col.key" :row="row" :group="group" :item="item">
                    {{ row[col.key] }}
                  </slot>
                </td>

                <!-- group 層級：只在 itemIndex=0 時渲染，rowspan 為該 group 品項數 -->
                <td
                  v-else-if="col.level === 'group' && itemIndex === 0"
                  :rowspan="getItems(group).length"
                  :class="['merged', { center: col.align === 'center' }]"
                >
                  <slot :name="col.key" :row="row" :group="group" :item="item">
                    {{ group[col.key] }}
                  </slot>
                </td>

                <!-- item 層級：每列都渲染，無合併 -->
                <td
                  v-else-if="col.level === 'item'"
                  :class="{ center: col.align === 'center' }"
                >
                  <slot :name="col.key" :row="row" :group="group" :item="item">
                    {{ item[col.key] }}
                  </slot>
                </td>

              </template>
            </tr>
          </template>
        </template>
      </tbody>

      <tbody v-else>
        <tr>
          <td :colspan="columns.length" class="empty">— 無資料 —</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.merged-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  thead tr {
    background-color: var(--color-primary);

    th {
      color: #fff;
      font-weight: 600;
      padding: 0.65rem 0.75rem;
      text-align: center;
      letter-spacing: 0.02em;
      white-space: nowrap;
      border-right: 1px solid rgba(255, 255, 255, 0.2);

      &:last-child {
        border-right: none;
      }
    }
  }

  tbody {
    td {
      background-color: var(--color-surface);
      padding: 0.5rem 0.75rem;
      border: 1px solid rgba(124, 111, 224, 0.15);
      vertical-align: middle;

      &.center {
        text-align: center;
      }

      &.empty {
        text-align: center;
        color: var(--color-text-muted);
        padding: 2rem;
        font-size: 0.85rem;
      }
    }
  }
}
</style>
