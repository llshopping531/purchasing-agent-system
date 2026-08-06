<script setup lang="ts" generic="T">
/**
 * 通用下拉選取元件
 * 支援輸入關鍵字即時篩選選項，選取後 emit selectOption 事件
 * multiple 模式：可複選，以 tag 顯示已選項目，emit selectOptions
 */
import { ref, shallowRef, watch, nextTick } from 'vue'
import type { SelectOption } from '../../interfaces/common'

const pop = withDefaults(
  defineProps<{
    /** 選單標籤文字 */
    label: string
    /** 預設選取值（單選） */
    defaultValue: SelectOption<T> | undefined
    /** 完整選項清單 */
    optionList: SelectOption<T>[]
    /** 是否為必填欄位（顯示紅色星號） */
    required?: boolean
    /** 是否顯示欄位名稱 */
    isDisplayLable?: boolean
    /** 是否為複選模式 */
    multiple?: boolean
    /** 複選模式的預設已選值 */
    selectedValues?: SelectOption<T>[]
  }>(),
  {
    isDisplayLable: true,
    multiple: false,
  },
)

const emit = defineEmits<{
  /** 單選：使用者選取選項時觸發 */
  (e: 'selectOption', data: SelectOption<T>): void
  /** 複選：選取項目變更時觸發，帶出完整已選陣列 */
  (e: 'selectOptions', data: SelectOption<T>[]): void
}>()

/** 目前顯示的選項清單（經篩選後的結果） */
const currentOptionList = shallowRef<SelectOption<T>[]>([...pop.optionList])
/** 下拉清單是否展開 */
const isOpenOption = ref(false)
/** 單選：輸入框顯示文字 */
const inputValue = ref(pop.defaultValue?.name)
/** 複選：篩選文字 */
const filterText = ref('')
/** 複選：tag input 的 DOM ref */
const tagInputRef = ref<HTMLInputElement>()
/** 複選：已選項目 */
const selectedItems = shallowRef<SelectOption<T>[]>(pop.selectedValues ? [...pop.selectedValues] : [])

watch(() => pop.optionList, (newList) => {
  currentOptionList.value = [...newList]
})

watch(() => pop.defaultValue, (newDefault) => {
  inputValue.value = newDefault?.name ?? ''
  currentColor.value = newDefault?.color ?? ''
  selectedSingleName.value = newDefault?.name ?? ''
})

watch(() => pop.selectedValues, (vals) => {
  selectedItems.value = vals ? [...vals] : []
})

/** 目前選取項目的顏色（單選用） */
const currentColor = ref(pop.defaultValue?.color ?? '')
/** 單選：記錄已選項目名稱，供下拉清單 highlight 用 */
const selectedSingleName = ref(pop.defaultValue?.name ?? '')

function openOptionList() {
  isOpenOption.value = true
  if (pop.multiple) {
    nextTick(() => tagInputRef.value?.focus())
  }
}

function closeOptionList() {
  isOpenOption.value = false
  filterText.value = ''
  currentOptionList.value = pop.optionList
}

function selectOption(selectedOption: SelectOption<T>) {
  if (pop.multiple) {
    const idx = selectedItems.value.findIndex((i) => i.name === selectedOption.name)
    if (idx >= 0) {
      selectedItems.value = selectedItems.value.filter((_, i) => i !== idx)
    } else {
      selectedItems.value = [...selectedItems.value, selectedOption]
    }
    filterText.value = ''
    currentOptionList.value = pop.optionList
    emit('selectOptions', selectedItems.value as SelectOption<T>[])
  } else {
    isOpenOption.value = false
    inputValue.value = selectedOption.name
    currentColor.value = selectedOption.color ?? ''
    selectedSingleName.value = selectedOption.name
    currentOptionList.value = pop.optionList
    emit('selectOption', selectedOption)
  }
}

function removeTag(item: SelectOption<T>) {
  selectedItems.value = selectedItems.value.filter((i) => i.name !== item.name)
  emit('selectOptions', selectedItems.value as SelectOption<T>[])
}

function isSelected(option: SelectOption<T>) {
  return selectedItems.value.some((i) => i.name === option.name)
}

function filter() {
  const keyword = (pop.multiple ? filterText.value : inputValue.value ?? '').toUpperCase()
  currentOptionList.value = pop.optionList.filter((option) =>
    option.name.toUpperCase().includes(keyword),
  )
}
</script>

<template>
  <div class="select">
    <span v-show="isDisplayLable" class="label">
      {{ label }}<span v-if="pop.required" class="required-mark">*</span>
    </span>

    <!-- 複選模式 -->
    <div
      v-if="pop.multiple"
      class="multi-box"
      :class="{ open: isOpenOption }"
      @mousedown.prevent="openOptionList"
    >
      <div class="tags-area">
        <span v-for="item in selectedItems" :key="item.name" class="tag">
          {{ item.name }}
          <button class="tag-remove" @mousedown.stop="removeTag(item)">✕</button>
        </span>
        <input
          ref="tagInputRef"
          class="tag-input"
          type="text"
          v-model="filterText"
          @focus="openOptionList"
          @blur="closeOptionList"
          @input="filter"
          :placeholder="selectedItems.length === 0 ? '搜尋或選取...' : ''"
        />
      </div>
    </div>

    <!-- 單選模式 -->
    <input
      v-else
      class="currentValue"
      type="text"
      :style="currentColor ? { color: currentColor, fontWeight: '600' } : {}"
      @focus="openOptionList()"
      @blur="closeOptionList()"
      @input="filter()"
      v-model="inputValue"
    />

    <div class="optionList" v-if="isOpenOption">
      <div v-if="currentOptionList.length === 0" class="optionItem empty">— 無資料 —</div>
      <div
        class="optionItem"
        :class="{ selected: pop.multiple ? isSelected(option) : option.name === selectedSingleName }"
        v-for="option in currentOptionList"
        :key="option.name"
        :style="{
          ...(option.color ? { borderLeft: `3px solid ${option.color}`, color: option.color } : {}),
          ...(option.strikethrough ? { textDecoration: 'line-through', color: 'var(--color-danger, #e53e3e)' } : {}),
        }"
        @mousedown.prevent="selectOption(option)"
      >
        <span v-if="pop.multiple" class="check-mark">{{ isSelected(option) ? '✓' : '' }}</span>
        <slot name="option-item" :option="option">{{ option.name }}</slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.select {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;

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
  width: 100%;
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
  @media (max-width: 768px) {
    font-size: 1rem;
  }
}

/* 複選輸入框 */
.multi-box {
  min-height: 38px;
  padding: 0.3rem 0.625rem;
  border: 1.5px solid rgba(124, 111, 224, 0.3);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: text;
  transition: border-color 0.15s, box-shadow 0.15s;

  &.open {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(124, 111, 224, 0.1);
  }
}

.tags-area {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  align-items: center;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.15rem 0.5rem;
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  border-radius: 99px;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.5;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.65rem;
  color: var(--color-primary);
  padding: 0;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.1s;

  &:hover {
    opacity: 1;
  }
}

.tag-input {
  flex: 1;
  min-width: 80px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  padding: 0.15rem 0.25rem;
  color: var(--color-text-primary);

  &::placeholder {
    color: #bbb;
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.1s;

    &:hover {
      background: var(--color-primary-muted);
      color: var(--color-primary-dark);
    }

    &.selected {
      background: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
      font-weight: 600;
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

.check-mark {
  width: 1rem;
  font-size: 0.8rem;
  color: var(--color-primary);
  flex-shrink: 0;
}

.required-mark {
  color: var(--color-danger, #e53e3e);
  margin-left: 0.2rem;
  font-weight: 700;
}
</style>
