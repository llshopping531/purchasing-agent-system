<script setup lang="ts">
/**
 * 活動下拉選取元件
 * 掛載時自動從 API 載入所有活動，選取後 emit selectOption 事件
 */
import { useMenuStore } from '@/stores/menu'
import { onMounted, ref } from 'vue'
import type { SelectOption } from '@/interfaces/common'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import type { EventsResBase } from '@/services/api/events/events-api-interfaces'

const props = defineProps<{
  /** 是否為必填欄位 */
  required?: boolean
  /** 初始選取的活動 ID（用於還原暫存狀態） */
  initialId?: string
}>()

const emit = defineEmits<{
  /** 使用者選取活動時觸發，帶出活動對應的 Option */
  (e: 'selectOption', data: SelectOption<EventsResBase | null>): void
}>()
const menuStore = useMenuStore()
const defaultValue = ref<SelectOption<EventsResBase | null>>({ name: '請選擇場次', value: null })

/** 轉換為 Option 格式的活動清單 */
const eventList = ref<SelectOption<EventsResBase | null>[]>([{ name: '請選擇場次', value: null }])

onMounted(() => {
  getEventList()
})

/**
 * 將選取的活動向上 emit
 * @param data - 選取的 Option
 */
function selectEvent(data: SelectOption<EventsResBase | null>) {
  if (!data.value) return
  emit('selectOption', data)
}

/**
 * 從 store 取得所有活動（第一次會呼叫 API，後續讀快取）
 */
async function getEventList() {
  const eventsAllRes = await menuStore.fetchEventsAll()
  if (eventsAllRes.length !== 0) {
    eventList.value = [...eventsAllRes].map((res) => ({
      name: res.name,
      value: res,
    }))
    if (props.initialId) {
      const found = eventList.value.find((opt) => opt.value?.id.toString() === props.initialId)
      if (found) defaultValue.value = found
    }
  }
}
</script>

<template>
  <select-component
    label="場次"
    :defaultValue="defaultValue"
    :optionList="eventList"
    :required="props.required"
    @selectOption="selectEvent"
  ></select-component>
</template>
