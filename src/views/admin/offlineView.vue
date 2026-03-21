<script setup lang="ts">
import SelectComponent from "@/components/inputs/SelectComponent.vue";
import type { Option } from "../../interfaces/common";
import TableComponent from "@/components/TableComponent.vue";

interface TableData {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
}

const eventList: Option[] = [
  { value: "0", name: "12月" },
  { value: "1", name: "3月" },
];

const shopList: Option[] = [];
const headerRow = [
  { name: "欄位一", value: "col1", sort: 0 },
  { name: "欄位2", value: "col2", sort: 3 },
  { name: "欄位3", value: "col3", sort: 2 },
  { name: "欄位4", value: "col4", sort: 1 },
];
const tableData = [
  { col1: "col1Value", col2: "col2Value", col3: "col3Value", col4: "col4Value" },
  { col1: "col1Value2", col2: "col2Value2", col3: "col3Value2", col4: "col4Value2" },
  { col1: "col1Value3", col2: "col2Value3", col3: "col3Value3", col4: "col4Value3" },
];

function deleteData(data: TableData) {
  console.log(`delete${JSON.stringify(data)}`);
}
function editData(data: TableData) {
  console.log(`edit${JSON.stringify(data)}`);
}
</script>
<template>
  <div class="offline">
    <h3>場販專區</h3>
    <p>請選擇場販場次、通路</p>

    <div class="shopList">
      <SelectComponent
        label="場次"
        :defaultValue="{ value: '0', name: '12月' }"
        :optionList="eventList"
      ></SelectComponent>
      <SelectComponent
        label="通路"
        :defaultValue="null"
        :optionList="shopList"
      ></SelectComponent>
    </div>
    <TableComponent
      :headerRow="headerRow"
      :tableData="tableData"
      :operate="{ isDelete: true, isEdit: true }"
      @delete="deleteData"
      @edit="editData"
    ></TableComponent>
    <router-view></router-view>
  </div>
</template>

<style>
.shopList {
  display: flex;
  gap: 1rem;
  .shopSelect {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border: 1px solid #8cbfa4;
  }
}
</style>
