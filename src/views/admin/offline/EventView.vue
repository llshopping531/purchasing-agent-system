<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
let currentEventInfo: { id: string; name: string };

onMounted(() => {
  getEventInfo();
});

watch(
  () => route.path,
  () => {
    getEventInfo();
  }
);

function getEventInfo() {
  const info = { id: (route.params as { id: string }).id, name: "3月" };
  currentEventInfo = info;
}
</script>

<template>
  <div v-if="currentEventInfo">{{ currentEventInfo.name }}</div>

</template>

<style lang="scss" scoped></style>
