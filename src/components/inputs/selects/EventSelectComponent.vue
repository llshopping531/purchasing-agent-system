<script setup lang="ts">
/**
 * 活動下拉選取元件
 * 掛載時自動從 API 載入所有活動，選取後 emit selectOption 事件
 */
import { eventApi } from '@/services/api/events/events-api'
import { onMounted, ref } from 'vue'
import type { Option } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'

const emit = defineEmits<{
  /** 使用者選取活動時觸發，帶出活動對應的 Option */
  (e: 'selectOption', data: Option): void
}>()
const defaultValue = ref<Option>({ name: '請選擇場次', value: '請選擇場次' })

  /** 轉換為 Option 格式的活動清單 */
const eventList = ref<Option[]>([{ name: '請選擇場次', value: '請選擇場次' }])

onMounted(() => {
  getEventList()
})

/**
 * 將選取的活動向上 emit
 * @param data - 選取的 Option
 */
function selectEvent(data: Option) {
  emit('selectOption', data)
}

/**
 * 從 API 取得所有活動並轉換為 Option 清單
 */
async function getEventList() {
  const eventsAllRes = await eventApi.getEventsAll()
  if (eventsAllRes.length !== 0) {
    eventList.value = eventsAllRes.map((res) => ({
      name: res.name,
      value: res.id.toString(),
    }))
  }
}
</script>

<template>
  <select-component
    label="場次"
    :defaultValue="defaultValue"
    :optionList="eventList"
    @selectOption="selectEvent"
  ></select-component>
</template>
