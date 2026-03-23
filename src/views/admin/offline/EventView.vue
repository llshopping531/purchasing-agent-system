<script setup lang="ts">
import TextInput from '@/components/inputs/TextInput.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { eventApi, type EventData } from '@/services/event-api'
import { onMounted, ref } from 'vue'

const eventList = ref<EventData[]>([])
const headerRow = ref<HeaderRow[]>([
  { name: '活動名稱', value: 'name', sort: 0 },
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

function createEvent() {
  postEvents('')
  colseCreateEventModal()
}

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
    <ModalComponent
      name="新增活動"
      width = '500px'
      @confirm="createEvent"
      @cancel="colseCreateEventModal"
      v-if="isShowCreateEventModal"
    >
      <template #content>
        <div class="row">
          <TextInput label="活動名稱"></TextInput>
          <TextInput label="是否顯示"></TextInput>
        </div>
        <div class="row">
          <TextInput label="開始日期"></TextInput>
          <TextInput label="結束日期"></TextInput>
        </div>
      </template>
    </ModalComponent>
  </div>
</template>

<style scoped>
.event {
  margin-top: 1rem;
  .row {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }
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
