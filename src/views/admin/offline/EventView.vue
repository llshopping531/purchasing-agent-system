<script setup lang="ts">
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import { eventApi, type EventData } from '@/services/api/event-api'
import { onMounted, ref } from 'vue'

const eventList = ref<EventData[]>([])
const headerRow = ref<HeaderRow[]>([
  { name: '活動名稱', value: 'name', sort: 0, width: '200px' },
  { name: '開始日期', value: 'startDate', sort: 0, width: '100px' },
  { name: '結束日期', value: 'endDate', sort: 0, width: '100px' },
  { name: '是否顯示', value: 'isHidden', sort: 0, width: '100px' },
])
const isShowEventFormModal = ref<boolean>(false)
const currentEventId = ref<number>(0)
const currentEventName = ref<string>('')
const currentStartDate = ref<string>('')
const currentEndDate = ref<string>('')
const currentIsHidden = ref<boolean>(false)
// 1新增 2修改 3刪除
const modalMode = ref<1 | 2 | 3>(1)

onMounted(() => {
  getEventsAll()
})

function createEvent() {
  modalMode.value = 1
  isShowEventFormModal.value = true
}

function editEvent(currentData: EventData) {
  modalMode.value = 2
  currentEventId.value = currentData.id
  currentEventName.value = currentData.name
  currentStartDate.value = currentData.startDate
  currentEndDate.value = currentData.endDate
  currentIsHidden.value = currentData.isHidden
  isShowEventFormModal.value = true
}

async function deleteEvent(currentData: EventData) {
  modalMode.value = 3
  currentEventId.value = currentData.id
  currentEventName.value = currentData.name
  isShowEventFormModal.value = true
}

async function getEventsAll() {
  eventList.value = await eventApi.getEventsAll()
}

async function confirm() {
  const eventData = {
    name: currentEventName.value,
    startDate: currentStartDate.value,
    endDate: currentEndDate.value,
    isHidden: currentIsHidden.value,
  }
  if (modalMode.value === 1) await eventApi.postEvents(eventData)
  if (modalMode.value === 2) await eventApi.patchEvents(eventData, { id: currentEventId.value })
  if (modalMode.value === 3) await eventApi.deleteEvents({ id: currentEventId.value })
  closeModal()
  getEventsAll()
}

function closeModal() {
  currentEventId.value = 0
  currentEventName.value = ''
  currentStartDate.value = ''
  currentEndDate.value = ''
  currentIsHidden.value = false
  isShowEventFormModal.value = false
}
</script>

<template>
  <div class="event">
    <div class="eventHeader">
      <h3>活動管理</h3>
      <div class="operateBox">
        <div class="btn" @click="createEvent">新增</div>
      </div>
    </div>
    <table-component
      :headerRow="headerRow"
      :tableData="eventList"
      :operate="{ isDelete: true, isEdit: true, isOperate: true }"
      @edit="editEvent"
      @delete="deleteEvent"
    ></table-component>
    <confirm-modal-component
      v-if="isShowEventFormModal"
      :name="modalMode === 1 ? '新增活動' : '編輯活動'"
      :confromText="
        modalMode === 3
          ? `您確定要刪除 ${currentEventName} 嗎？`
          : modalMode === 1
            ? '您確定要新增此活動嗎？'
            : '您確定要編輯此活動嗎？'
      "
      :isDelete="modalMode === 3"
      width="500px"
      @cancel="closeModal"
      @confirm="confirm"
    >
      <template #content>
        <div class="row">
          <text-input label="活動名稱" v-model:value="currentEventName"></text-input>
          <text-input label="是否顯示" v-model:value="currentIsHidden"></text-input>
        </div>
        <div class="row">
          <text-input label="開始日期" v-model:value="currentStartDate"></text-input>
          <text-input label="結束日期" v-model:value="currentEndDate"></text-input>
        </div>
      </template>
    </confirm-modal-component>
  </div>
</template>

<style scoped>
.event {
  margin-top: 2rem;
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
