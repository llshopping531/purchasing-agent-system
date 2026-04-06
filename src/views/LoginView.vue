<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import TextInput from '../components/inputs/TextInput.vue'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

function login() {
  userStore.login({ name: 'Lily', admin: true })
  let path = userStore.redirectPath
  if (path === '') {
    path = userStore.isAdmin ? '/admin' : '/user'
  }
  router.push(path)
}
</script>

<template>
  <div class="login">
    <div class="wrapper">
      <div class="logo-area">
        <img alt="Vue logo" src="@/assets/logo.svg" width="52" height="52" />
      </div>
      <h1>會員登入</h1>
      <p class="subtitle">歡迎回來，請登入您的帳號</p>

      <text-input label="帳號" placeholder="請輸入帳號" />
      <text-input label="密碼" placeholder="請輸入密碼" />

      <button class="btn login-btn" type="button" @click="login()">登入</button>

      <div class="linkBox">
        <router-link to="/"> 回首頁 </router-link>
      </div>
    </div>
  </div>
  <main>
    <router-view />
  </main>
</template>

<style>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);

  .wrapper {
    padding: 2.5rem 3rem 2rem;
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 380px;
    max-width: 90vw;
  }

  .logo-area {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  h1 {
    color: var(--color-primary-dark);
    font-weight: 800;
    text-align: center;
    font-size: 1.4rem;
    margin-bottom: 0.25rem;
  }

  .subtitle {
    text-align: center;
    color: var(--color-text-muted);
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .login-btn {
    margin: 2rem 0 0;
    width: 100%;
    padding: 0.6rem;
    font-size: 0.95rem;
  }

  .linkBox {
    margin-top: 1.5rem;
    text-align: center;

    a {
      font-size: 0.82rem;
      color: var(--color-text-secondary);
      text-decoration: underline;
      background: none;

      &:hover {
        color: var(--color-primary);
        background: none;
      }
    }
  }
}
</style>
