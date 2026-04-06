<script setup lang="ts">
/**
 * 活動管理頁面
 * 顯示所有活動的列表，並透過 EventFormModal ref 處理新增／編輯／刪除操作
 */
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { eventApi, type EventData } from '@/services/api/event-api'
import { onMounted, ref } from 'vue'
import EventFormModal from './EventFormModal.vue'

/** 活動列表資料 */
const eventList = ref<EventData[]>([])

/** 表格欄位定義 */
const headerRow = ref<HeaderRow[]>([
  { name: '活動名稱', value: 'name', sort: 0, width: '200px' },
  { name: '開始日期', value: 'startDate', sort: 0, width: '120px' },
  { name: '結束日期', value: 'endDate', sort: 0, width: '120px' },
  { name: '是否顯示', value: 'isHidden', sort: 0, width: '100px' },
])

/** EventFormModal 元件的 ref，用於呼叫其 createEvent / editEvent / deleteEvent */
const eventFormModal = ref<InstanceType<typeof EventFormModal>>()

onMounted(() => {
  getEventsAll()
})

/**
 * 從 API 取得所有活動並更新列表
 */
async function getEventsAll() {
  eventList.value = await eventApi.getEventsAll()
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
      :operate="{ isDelete: true, isEdit: true, isOperate: true }"
      @edit="eventFormModal?.editEvent($event)"
      @delete="eventFormModal?.deleteEvent($event)"
    ></table-component>
    <event-form-modal ref="eventFormModal" @confirmed="getEventsAll"></event-form-modal>
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
