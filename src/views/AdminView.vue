<script setup lang="ts">
import HeaderComponent from "@/components/HeaderComponent.vue";
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const buttonList = [{ name: "前往使用者前台系統", link: "/user" }];
enum Channel {
  online = "/admin/online",
  offline = "/admin/offline",
}
const currentChannelTab = ref(Channel.offline);

onMounted(() => {
  if (route.path === '/admin') {
    router.push(currentChannelTab.value);
  }
});

function clickChannel(channelName: Channel) {
  currentChannelTab.value = channelName;
}
</script>

<template>
  <header-component
    title="ㄌㄌ代購 管理者後台系統"
    :buttonList="buttonList"
  ></header-component>
  <div class="channelList">
    <router-link
      :to="Channel.online"
      class="channelItem"
      :class="{ active: currentChannelTab === Channel.online }"
      @click="clickChannel(Channel.online)"
    >
      通販專區
    </router-link>
    <router-link
      :to="Channel.offline"
      class="channelItem"
      :class="{ active: currentChannelTab === Channel.offline || route.path.startsWith('/admin/offline') }"
      @click="clickChannel(Channel.offline)"
    >
      場販專區
    </router-link>
  </div>
  <div class="channelContent">
    <router-view></router-view>
  </div>
</template>

<style scoped>
.channelList {
  display: flex;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0 1.5rem;

  .channelItem {
    padding: 0.75rem 1.25rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    border-bottom: 2.5px solid transparent;
    transition:
      color 0.15s,
      border-color 0.15s;
    margin-bottom: -1px;
    text-decoration: none;
    background: transparent;

    &:hover {
      color: var(--color-primary);
      background: transparent;
    }

    &.active,
    &.router-link-active {
      color: var(--color-primary);
      border-bottom-color: var(--color-primary);
      font-weight: 600;
      background: transparent;
    }
  }
}
</style>
