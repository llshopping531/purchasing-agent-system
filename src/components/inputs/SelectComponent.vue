<script setup lang="ts">
import { ref, watch } from "vue";
import type { Option } from "../../interfaces/common";
const pop = defineProps<{
  label: string;
  defaultValue: Option | undefined;
  optionList: Option[];
}>();
const emit = defineEmits<{
  (e: "selectOption", data: Option): void;
}>();

const currentOptionList = ref([...pop.optionList]);
const isOpenOption = ref(false);
const inputValue = ref(pop.defaultValue?.name);

watch(
  () => pop.optionList,
  (newList) => {
    currentOptionList.value = [...newList];
  }
);

watch(
  () => pop.defaultValue,
  (newDefault) => {
    inputValue.value = newDefault?.name ?? "";
  }
);

function openOptionList() {
  isOpenOption.value = true;
}
function closeOptionList() {
  isOpenOption.value = false;
}
function selectOption(selectedOption: Option) {
  isOpenOption.value = false;
  inputValue.value = selectedOption.name;
  currentOptionList.value = pop.optionList;
  emit("selectOption", selectedOption);
}
function filter() {
  currentOptionList.value = pop.optionList.filter((option) =>
    option.name.includes(inputValue.value ?? "")
  );
}
</script>

<template>
  <div class="select">
    <span class="label">{{ label }}</span>
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
  margin-top: 1rem;
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
