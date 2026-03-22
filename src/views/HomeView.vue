<script setup lang="ts">
import { PATH } from "@/router/route-constant";
import AppGreetings from "../components/AppGreetings.vue";
</script>

<template>
  <div class="home">
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <AppGreetings name="ㄌㄌ代購" />

      <nav>
        <RouterLink :to="PATH.user">使用者前台系統</RouterLink>
        <RouterLink :to="PATH.admin">管理者後台系統</RouterLink>
      </nav>
    </div>
  </div>
  <main>
    <RouterView />
  </main>
</template>

<style>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-self: center;
  .wrapper {
    margin-left: 2rem;
  }
}
nav {
  margin-left: auto;
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  a {
    border: 1px solid #00bd7e;
    padding: 0.25rem 0.75rem;
  }
}
</style>
