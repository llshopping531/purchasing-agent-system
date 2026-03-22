<script setup lang="ts">
import { PATH } from "@/router/route-constant";
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const functionList = [{ name: "訂單管理", path: PATH.offlineOrder },{ name: "活動管理", path: PATH.offlineEvent }];

onMounted(() => {
  router.push(PATH.offlineOrder);
});
</script>
<template>
  <div class="offline">
    <!-- <h3 class="title">快速功能</h3> -->
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
