<script setup lang="ts">
import { PATH } from "@/router/route-constant";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

onMounted(() => {
  console.log(PATH.offlineOrder)
  router.push(PATH.offlineOrder);
});
</script>
<template>
  <div class="offline">
    <!-- <h3 class="title">快速功能</h3> -->
    <div class="functionList">
      <router-link :to="PATH.offlineOrder" class="functionItem">訂單管理</router-link>
      <router-link :to="PATH.offlineOrder" class="functionItem">訂單管理</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<style>
.offline {
  .title {
    font-weight: bold;
    color: #183a28;
  }
  .functionList {
    display: flex;
    gap: 0.5rem;
    .functionItem {
      border: 1px solid #00bd7e;
      color: #00bd7e;
      padding: 0.5rem 1rem;
      cursor: pointer;
      &:hover {
        background-color: #8cbfa5;
        color: #fff;
      }
    }
  }
}
</style>
