<script setup lang="ts">
/**
 * 通用下拉選取元件
 * 支援輸入關鍵字即時篩選選項，選取後 emit selectOption 事件
 */
import { ref, watch } from 'vue'
import type { Option } from '../../interfaces/common'

const pop = defineProps<{
  /** 選單標籤文字 */
  label: string
  /** 預設選取值 */
  defaultValue: Option | undefined
  /** 完整選項清單 */
  optionList: Option[]
  /** 是否為必填欄位（顯示紅色星號） */
  required?: boolean
}>()

const emit = defineEmits<{
  /** 使用者選取選項時觸發，帶出選取的 Option */
  (e: 'selectOption', data: Option): void
}>()

/** 目前顯示的選項清單（經篩選後的結果） */
const currentOptionList = ref([...pop.optionList])
/** 下拉清單是否展開 */
const isOpenOption = ref(false)
/** 輸入框顯示的文字（選取後更新為選項名稱） */
const inputValue = ref(pop.defaultValue?.name)

// 當外部傳入的選項清單更新時，同步更新內部清單
watch(
  () => pop.optionList,
  (newList) => {
    currentOptionList.value = [...newList]
  },
)

// 當外部傳入的預設值更新時，同步更新輸入框文字
watch(
  () => pop.defaultValue,
  (newDefault) => {
    inputValue.value = newDefault?.name ?? ''
  },
)

/** 展開下拉清單 */
function openOptionList() {
  isOpenOption.value = true
}

/** 收起下拉清單 */
function closeOptionList() {
  isOpenOption.value = false
}

/**
 * 選取某個選項，收起清單並 emit 事件
 * @param selectedOption - 使用者點選的選項
 */
function selectOption(selectedOption: Option) {
  isOpenOption.value = false
  inputValue.value = selectedOption.name
  currentOptionList.value = pop.optionList
  emit('selectOption', selectedOption)
}

/** 依輸入框文字即時篩選選項清單 */
function filter() {
  currentOptionList.value = pop.optionList.filter((option) =>
    option.name.includes(inputValue.value ?? ''),
  )
}
</script>

<template>
  <div class="select">
    <span class="label">{{ label }}<span v-if="pop.required" class="required-mark">*</span></span>
    <input
      class="currentValue"
      type="text"
      @focus="openOptionList()"
      @blur="closeOptionList()"
      @input="filter()"
      v-model="inputValue"
    />

    <div class="optionList" v-if="isOpenOption">
      <div v-if="currentOptionList.length === 0" class="optionItem empty">— 無資料 —</div>
      <div
        class="optionItem"
        v-for="option in currentOptionList"
        :key="option.value"
        @mousedown="selectOption(option)"
      >
        {{ option.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.select {
  display: flex;
  flex-direction: column;
  width: fit-content;
  position: relative;
  min-width: 180px;

  .label {
    margin-bottom: 0.35rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
}

.currentValue {
  padding: 0.5rem 0.875rem;
  font-size: 0.9rem;
  border: 1.5px solid rgba(124, 111, 224, 0.3);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(124, 111, 224, 0.1);
  }

  &:focus-visible {
    outline: none;
  }
}

.optionList {
  border: 1.5px solid rgba(124, 111, 224, 0.3);
  border-top: none;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-md);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  transform: translateY(calc(100% - 1px));
  max-height: 280px;
  overflow-y: auto;
  z-index: 100;

  .optionItem {
    padding: 0.5rem 0.875rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.1s;

    &:hover {
      background: var(--color-primary-muted);
      color: var(--color-primary-dark);
    }

    &.empty {
      color: var(--color-text-muted);
      text-align: center;
      cursor: default;
      font-size: 0.85rem;

      &:hover {
        background: none;
        color: var(--color-text-muted);
      }
    }
  }
}
</style>
