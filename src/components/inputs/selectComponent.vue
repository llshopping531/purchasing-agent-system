<script setup lang="ts">
import { ref, watch } from "vue";
import type { Option } from "../../interfaces/common";
const pop = defineProps<{
  label: string;
  defaultValue: Option | undefined;
  optionList: Option[];
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

function openOptinoList() {
  isOpenOption.value = true;
}
function closeOptinoList() {
  isOpenOption.value = false;
}
function selectOption(selectedOption: Option) {
  isOpenOption.value = false;
  inputValue.value = selectedOption.name;
  currentOptionList.value = pop.optionList;
}
function fittler() {
  currentOptionList.value = pop.optionList.filter((option) =>
    option.name.includes(inputValue.value ?? "")
  );
}
</script>

<template>
  <div class="selectBox">
    <span class="label">{{ label }}</span>
    <input
      class="currentVule"
      type="text"
      @focus="openOptinoList()"
      @blur="closeOptinoList()"
      @input="fittler()"
      v-model="inputValue"
    />

    <div class="optionList" v-if="isOpenOption">
      <div v-if="currentOptionList.length === 0" class="optionItem">---無資料---</div>
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
  .selectBox {
    display: flex;
    flex-direction: column;
    width: fit-content;
    margin-bottom: 1rem;
    position: relative;
    .label {
      margin-bottom: 0.25rme;
    }
  }
  .currentVule {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 1px solid #8cbfa4;

    &:focus-visible {
      outline: #8cbfa4 auto 2px;
    }
  }
  .optionList {
    border: 1px solid #353636;
    display: inline-block;
    background: #fff;
    position: absolute;
    bottom: 0px;
    left: 0;
    right: 0;
    transform: translateY(calc(100% - 1px));
    .optionItem {
      padding: 0.5rem;
      min-width: 100px;
      &:hover {
        background-color: #8cbfa5;
        color: #fff;
        cursor: pointer;
      }
    }
  }
</style>
