<script setup lang="ts">
import { PATH } from '@/router/route-constant'

const functionList = [
  { name: '訂單管理', path: PATH.offlineOrder },
  { name: '活動管理', path: PATH.offlineEvent },
  { name: '採購清單', path: PATH.offlinePurchaseList },
  { name: '顧客管理', path: PATH.offlineCustomer },
  { name: '商品管理', path: PATH.offlineProduct },
]

</script>
<template>
  <div class="offline">
    <div class="functionList">
      <router-link
        :to="item.path"
        class="functionItem"
        v-for="item in functionList"
        :key="item.name"
        >{{ item.name }}</router-link
      >
    </div>
    <router-view></router-view>
  </div>
</template>

<style>
.offline {
  .functionList {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;

    .functionItem {
      border: 1.5px solid var(--color-primary);
      color: var(--color-primary);
      padding: 0.35rem 1rem;
      cursor: pointer;
      border-radius: var(--radius-xl);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s;
      text-decoration: none;
      background: transparent;

      &:hover,
      &.router-link-active {
        background: var(--color-primary);
        color: #fff;
      }
    }
  }
}
</style>
