<script setup lang="ts">
import HeaderComponent from "@/components/HeaderComponent.vue";
import { ref } from "vue";

const buttonList = [{ name: "前往使用者前台系統", link: "/user" }];
enum Channel {
  online = "online",
  offline = "offline",
}
const currentChannelTab = ref(Channel.offline);

function clickChannel(channelName: Channel) {
  currentChannelTab.value = channelName;
}
</script>

<template>
  <HeaderComponent
    title="ㄌㄌ代購 管理者後台系統"
    :buttonList="buttonList"
  ></HeaderComponent>
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
      :class="{ active: currentChannelTab === Channel.offline }"
      @click="clickChannel(Channel.offline)"
    >
      場販專區
    </router-link>
  </div>
  <div class="channelContent">
    <router-view></router-view>
  </div>
</template>

<style scope>
.channelList {
  display: flex;
  .channelItem {
    padding: 0.5rem 2rem;
    cursor: pointer;
    &.active {
      background: #8cbfa5;
      color: #fff;
      font-weight: bold;
    }
  }
}
.channelContent{
  padding: 1rem;
}
</style>
