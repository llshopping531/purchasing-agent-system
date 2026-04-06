<script setup lang="ts">
/**
 * 活動管理頁面
 * 顯示所有活動的列表，並透過 EventFormModal ref 處理新增／編輯／刪除操作
 */
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { eventApi } from '@/services/api/events/events-api'
import { onMounted, ref } from 'vue'
import EventFormModal from './EventFormModal.vue'
import type { QueryEventsContent } from '@/services/api/events/events-api-interfaces'

/** 活動列表資料 */
const eventList = ref<QueryEventsContent[]>([])

/** 表格欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '活動名稱', value: 'name', sort: 0, width: '200px' },
  { name: '開始日期', value: 'startDate', sort: 0, width: '120px' },
  { name: '結束日期', value: 'endDate', sort: 0, width: '120px' },
  { name: '是否顯示', value: 'isHidden', sort: 0, width: '100px' },
])

/** EventFormModal 元件的 ref，用於呼叫其 createEvent / editEvent / deleteEvent */
const eventFormModal = ref<InstanceType<typeof EventFormModal>>()
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
 * 從 API 取得活動並更新列表
 */
async function getEventList() {
  const res = await eventApi.getEvents({
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
  <div class="event">
    <div class="eventHeader">
      <h3>活動管理</h3>
      <div class="operateBox">
        <div class="btn" @click="eventFormModal?.createEvent()">新增</div>
      </div>
    </div>
    <table-component
      :headerRow="headerRow"
      :tableData="eventList"
      :totalPages="totalPages"
      :currentPage="currentPage"
      :totalElements="totalElements"
      :pageSize="pageSize"
      @edit="eventFormModal?.editEvent($event)"
      @delete="eventFormModal?.deleteEvent($event)"
      @change-page="onChangePage"
      @change-size="onChangeSize"
    >
    </table-component>
    <event-form-modal ref="eventFormModal" @confirmed="getEventList"></event-form-modal>
  </div>
</template>

<style scoped>
.event {
  margin-top: 2rem;
  .eventHeader {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .operateBox {
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 0.5rem;
    .btn {
      margin: 0;
    }
  }
}
</style>
