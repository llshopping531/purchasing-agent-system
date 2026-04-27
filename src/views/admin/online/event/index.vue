<script setup lang="ts">
/**
 * 通販活動管理頁面
 * 顯示所有通販活動的列表
 */
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { onlineEventApi } from '@/services/api/online/online-events/online-events-api'
import { onMounted, ref } from 'vue'
import type { QueryOnlineEventsContent } from '@/services/api/online/online-events/online-events-api-interfaces'
import BooleanTransformComponent from '@/components/BooleanTransformComponent.vue'

/** 通販活動列表資料 */
const eventList = ref<QueryOnlineEventsContent[]>([])

/** 表格欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '活動名稱', value: 'name', sort: 0, mobileSpan: 3 },
  { name: '開團日期', value: 'startDate', sort: 0, width: '120px' },
  { name: '進度', value: 'progressName', sort: 0, width: '100px' },
  { name: '官方出貨日', value: 'deliveryDate', sort: 0, width: '120px' },
  { name: '備註', value: 'note', sort: 0 },
  { name: '是否鎖定', value: 'isLocked', sort: 0, width: '100px' },
])

/** 當前頁碼（0-based） */
const currentPage = ref(0)
/** 每頁筆數 */
const pageSize = ref(20)
/** 總頁數 */
const totalPages = ref(0)
/** 總筆數 */
const totalElements = ref(0)

onMounted(() => {
  getEventList()
})

/**
 * 從 API 取得通販活動並更新列表
 */
async function getEventList() {
  const res = await onlineEventApi.getOnlineEvents({
    page: currentPage.value,
    size: pageSize.value,
  })
  eventList.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
}

/**
 * 換頁
 * @param page - 目標頁碼（0-based）
 */
function onChangePage(page: number) {
  currentPage.value = page
  getEventList()
}

/**
 * 更改每頁筆數
 * @param size - 新的每頁筆數
 */
function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getEventList()
}
</script>

<template>
  <div class="online-event">
    <div class="eventHeader">
      <h3>通販活動管理</h3>
    </div>
    <table-component
      :headerRow="headerRow"
      :tableData="eventList"
      :totalPages="totalPages"
      :currentPage="currentPage"
      :totalElements="totalElements"
      :pageSize="pageSize"
      :showActions="false"
      @change-page="onChangePage"
      @change-size="onChangeSize"
    >
      <template #col-isLocked="{ row }">
        <boolean-transform-component :value="row.isLocked"></boolean-transform-component>
      </template>
    </table-component>
  </div>
</template>

<style scoped>
.online-event {
  .eventHeader {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
}
</style>
