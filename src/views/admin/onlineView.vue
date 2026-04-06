<script setup lang="ts">
/**
 * 通販專區頁面（尚在開發中）
 * 目前使用靜態假資料，待後端 API 完成後替換
 */

/** 活動項目結構 */
interface EventItem {
  /** 活動 ID */
  id: number
  /** 活動名稱 */
  name: string
}

/** 通販活動清單（暫時為靜態假資料） */
const eventList: EventItem[] = [
  { id: 0, name: '12月' },
  { id: 1, name: '3月' },
]

/** 通路清單（暫時為靜態假資料） */
const shopList: EventItem[] = [
  { id: 0, name: '大交流展' },
  { id: 1, name: 'plaza' },
]
</script>
<template>
  <div class="offline">
    <h1>通販專區</h1>
    <p>請選擇場販場次</p>
    <div class="shopList">
      <select name="event" id="event" class="shopSelect">
        <option :value="eventItem.id" v-for="eventItem in eventList" :key="eventItem.id">
          {{ eventItem.name }}
        </option>
      </select>
      <select name="shop" id="shop" class="shopSelect">
        <option :value="shopItem.id" v-for="shopItem in shopList" :key="shopItem.id">
          {{ shopItem.name }}
        </option>
      </select>
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
    border: 1px solid var(--color-primary);
  }
}
</style>
