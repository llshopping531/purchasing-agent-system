<script setup lang="ts">
import { PATH } from "@/router/route-constant";
import AppGreetings from "../components/AppGreetings.vue";
</script>

<template>
  <div class="home">
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="100" height="100" />

    <div class="wrapper">
      <app-greetings name="ㄌㄌ代購" />

      <nav class="home-nav">
        <router-link :to="PATH.user">使用者前台系統</router-link>
        <router-link :to="PATH.admin">管理者後台系統</router-link>
      </nav>
    </div>
  </div>
  <main>
    <router-view />
  </main>
</template>

<style>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
}

.home-nav {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  a {
    border: 1.5px solid var(--color-primary);
    padding: 0.45rem 1.2rem;
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    color: var(--color-primary);
    text-align: center;
    font-weight: 500;
    transition: all 0.15s;
    background: transparent;

    &:hover {
      background: var(--color-primary);
      color: #fff;
    }
  }
}
</style>
