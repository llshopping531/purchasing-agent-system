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
      <h1>會員登入</h1>

      <text-input label="帳號" placeholder="請輸入帳號" />
      <text-input label="密碼" placeholder="請輸入密碼" />

      <button class="btn" type="button" @click="login()">登入</button>

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
  justify-self: center;
  .btn {
    margin: 2rem auto 0;
  }

  .wrapper {
    padding: 5rem 5rem 2rem;
    background-color: #fff;
    border-radius: 0.5rem;
    box-shadow: 0.5rem 0.5rem 1rem #d4dddb;
  }
  h1 {
    color: #00bd7e;
    font-weight: bold;
    text-align: center;
  }
  .linkBox {
    margin-top: 2rem;
    text-align: center;
    a {
      font-size: 0.8rem;
      color: #333;
      text-decoration: underline;
      &:hover {
        color: #00bd7e;
        background: unset;
      }
    }
  }
}
</style>
