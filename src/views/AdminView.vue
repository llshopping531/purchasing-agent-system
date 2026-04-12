<script setup lang="ts">
import HeaderComponent from "@/components/HeaderComponent.vue";
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (route.path === '/admin') {
    router.push('/admin/offline');
  }
});
</script>

<template>
  <header-component
    title="ㄌㄌ代購 管理者後台系統"
    :buttonList="[{ name: '前往前台', link: '/user' }]"
  ></header-component>
  <div class="channelContent">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.channelContent {
  min-height: calc(100vh - 53px);
}
</style>
