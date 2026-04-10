<script setup lang="ts">
/**
 * 通路管理頁面
 * 選取活動後顯示分頁通路列表，並透過 ChannelFormModal ref 處理新增／編輯／刪除操作
 */
import { ref } from 'vue'
import EventSelectComponent, { type EventOption } from '@/components/inputs/selects/EventSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import ChannelFormModal from './ChannelFormModal.vue'
import { channelApi, type ChannelContent } from '@/services/api/channels/channels-api'

const channelFormModalRef = ref<InstanceType<typeof ChannelFormModal>>()

const currentEventId = ref('')
const currentEventIsLocked = ref(true)
const isTableQueried = ref(false)

const headerRow: HeaderRow[] = [
  { name: '通路名稱', value: 'name', sort: 0, width: '200px', mobileSpan: 2 },
  { name: '匯率', value: 'exchangeRate', sort: 0, width: '100px' },
  { name: '日幣滿額門檻', value: 'thresholdJpy', sort: 0, width: '140px' },
]

const tableData = ref<ChannelContent[]>([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalPages = ref(0)
const totalElements = ref(0)

function selectEvent(data: EventOption) {
  currentEventId.value = data.selectedData.value
  currentEventIsLocked.value = data.isLocked
  currentPage.value = 0
  getChannelList()
}

async function getChannelList() {
  if (!currentEventId.value) return
  const res = await channelApi.getChannels({
    eventId: Number(currentEventId.value),
    page: currentPage.value,
    size: pageSize.value,
  })
  tableData.value = res.content
  totalPages.value = res.totalPages
  totalElements.value = res.totalElements
  isTableQueried.value = true
}

function onChangePage(page: number) {
  currentPage.value = page
  getChannelList()
}

function onChangeSize(size: number) {
  pageSize.value = size
  currentPage.value = 0
  getChannelList()
}
</script>

<template>
  <div class="channel">
    <h3>通路管理</h3>
    <p>請選擇場販場次</p>
    <div class="channelHeader">
      <div class="selectBox">
        <event-select-component @selectOption="selectEvent" />
      </div>
      <div class="btnBox">
        <div class="btn" v-if="isTableQueried && !currentEventIsLocked" @click="channelFormModalRef?.createChannel()">
          新增
        </div>
      </div>
    </div>
    <table-component
      v-if="isTableQueried"
      :headerRow="headerRow"
      :tableData="tableData"
      :is-delete="!currentEventIsLocked"
      :is-edit="!currentEventIsLocked"
      @edit="channelFormModalRef?.editChannel($event)"
      @delete="channelFormModalRef?.deleteChannel($event)"
    />
    <pagination-component
      v-if="totalPages > 0"
      :page="currentPage"
      :totalPages="totalPages"
      :totalElements="totalElements"
      :size="pageSize"
      @changePage="onChangePage"
      @changeSize="onChangeSize"
    />
    <channel-form-modal
      ref="channelFormModalRef"
      :eventId="currentEventId"
      @confirmed="getChannelList"
    />
  </div>
</template>

<style scoped>
.channel {
  .selectBox {
    display: flex;
    gap: 1rem;
    row-gap: 0.25rem;
  }
  .channelHeader {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    flex-wrap: wrap;
    margin-bottom: 1rem;

    .btnBox {
      display: flex;
      gap: 1rem;
    }
  }
}
</style>
