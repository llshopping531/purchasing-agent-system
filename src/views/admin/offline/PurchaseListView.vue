<script setup lang="ts">
import EventSelectComponent from '@/components/inputs/EventSelectComponent.vue'
import TableComponent, { type HeaderRow } from '@/components/tables/TableComponent.vue'
import type { Option } from '@/interfaces/common'
import { purchaseListApi, type AdditionalProp } from '@/services/purchase-api'
import { ref } from 'vue'
interface PurchaseList {
  channelName: string
  data: AdditionalProp[]
}

const headerRow = ref<HeaderRow[]>([
  { name: '商品名稱', value: 'productName', sort: 0, width: '200px' },
  { name: '應買數量', value: 'shouldBuy', sort: 0, width: '100px' },
  { name: '已買數量', value: 'purchased', sort: 0, width: '100px' },
  { name: '未買數量', value: 'remaining', sort: 0, width: '100px' },
])
const purchaseList = ref<PurchaseList[]>([])
const isOpenList = ref<boolean[]>([])

async function selectEvent(option: Option) {
  console.log('selectEvent')
  const res = await purchaseListApi.getPurchaseListsAll({ eventId: Number(option.value) })
  const keys = Object.keys(res)
  const list: PurchaseList[] = []
  const isOpen: boolean[] = []
  keys.forEach((key) => {
    list.push({ channelName: key, data: res[key] ?? [] })
    isOpen.push(false)
  })
  isOpenList.value = isOpen
  purchaseList.value = list
}

function toggleTable(index: number) {
  isOpenList.value[index] = !isOpenList.value[index]
}
</script>
<template>
  <div class="purchase">
    <div class="selectBox">
      <EventSelectComponent @select-option="selectEvent"></EventSelectComponent>
    </div>
    <template v-for="(purchase, index) in purchaseList" :key="purchase.channelName">
      <div class="titleBox" @click="toggleTable(index)">
        <h3>{{ purchase.channelName }}</h3>
        <div class="toggleBtn">
          <span class="icon" :class="{ active: isOpenList[index] }"></span>
        </div>
      </div>
      <div v-if="isOpenList[index]">
        <TableComponent
          :headerRow="headerRow"
          :tableData="purchase.data"
          :operate="{ isDelete: false, isEdit: false ,isOperate:false }"
        ></TableComponent>
      </div>
    </template>
  </div>
</template>
<style scoped>
.purchase {
  width: fit-content;
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
      border-left: 3px solid #354a5e;
      border-bottom: 3px solid #354a5e;
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
}
</style>
