<script setup lang="ts">
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import type { AdditionalProp } from '@/services/api/purchase-api'
import { ref } from 'vue'

defineProps<{
  channelName: string
  data: AdditionalProp[]
  headerRow: HeaderRow[]
}>()

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div>
    <div class="titleBox" @click="toggle">
      <h3>{{ channelName }}</h3>
      <div class="toggleBtn">
        <span class="icon" :class="{ active: isOpen }"></span>
      </div>
    </div>
    <div v-if="isOpen">
      <table-component
        :headerRow="headerRow"
        :tableData="data"
        :operate="{ isDelete: false, isEdit: false, isOperate: false }"
      ></table-component>
    </div>
  </div>
</template>

<style scoped>
.titleBox {
  display: flex;
  cursor: pointer;
}
.toggleBtn {
  position: relative;
  font-size: 2rem;
  width: 50px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  .icon {
    position: absolute;
    display: block;
    border-left: 3px solid var(--color-primary);
    border-bottom: 3px solid var(--color-primary);
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%) rotate(135deg);
    transition: all 0.3s;
    z-index: -1;
    &.active {
      transform: translate(-50%, -65%) rotate(315deg);
    }
  }
}
</style>
