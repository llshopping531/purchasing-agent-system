<script setup lang="ts">
import SelectComponent from "@/components/inputs/selectComponent.vue";
import { Option } from "../../interfaces/common";

const eventList: Option[] = [
  { value: "0", name: "12月" },
  { value: "1", name: "3月" },
];

const shopList: Option[] = [];
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
