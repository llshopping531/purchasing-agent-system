<script setup lang="ts">
import ModalComponent from '@/components/ModalComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { eventApi, type EventData } from '@/services/event-api'
import { onMounted, ref } from 'vue'

const eventList = ref<EventData[]>([])
const headerRow = ref<HeaderRow[]>([
  { name: '購買者', value: 'name', sort: 0 },
  { name: '開始日期', value: 'startDate', sort: 0 },
  { name: '結束日期', value: 'endDate', sort: 0 },
  { name: '是否顯示', value: 'isHidden', sort: 0 },
])
const isShowCreateEventModal = ref<boolean>(false)

onMounted(() => {
  getEventsAll()
})

function openCreateEventModal() {
  isShowCreateEventModal.value = true
}

function colseCreateEventModal() {
  isShowCreateEventModal.value = false
}

function createEvent() {}

async function getEventsAll() {
  eventList.value = await eventApi.getEventsAll()
}

async function postEvents(name: string) {
  eventList.value = await eventApi.postEvents({ name: name })
}
</script>

<template>
  <div class="event">
    <div class="eventHeader">
      <h3>活動管理</h3>
      <div class="operateBox">
        <div class="btn" @click="openCreateEventModal">新增</div>
      </div>
    </div>
    <TableComponent
      :headerRow="headerRow"
      :tableData="eventList"
      :operate="{ isDelete: true, isEdit: true }"
    ></TableComponent>
  </div>
  <ModalComponent name="新增活動"></ModalComponent>
</template>

<style scoped>
.event {
  margin-top: 1rem;
  .eventHeader {
    display: flex;
    justify-content: space-between;
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
