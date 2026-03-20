<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import TextInput from "../components/inputs/TextInput.vue";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

function login() {
  userStore.login({ name: "Lily", admin: true });
  let path = userStore.redirectPath;
  if (path === '') {
    path = userStore.isAdmin ? "/admin" : "/user";
  }
  router.push(path);
}
</script>

<template>
  <div class="login">
    <div class="wrapper">
      <h1>會員登入</h1>

      <TextInput label="帳號" placeholder="請輸入帳號" />
      <TextInput label="密碼" placeholder="請輸入密碼" />

      <button class="btn" type="button" @click="login()">登入</button>

      <div class="linkBox">
        <RouterLink to="/"> 回首頁 </RouterLink>
      </div>
    </div>
  </div>
  <main>
    <RouterView />
  </main>
</template>

<style>
@media (min-width: 1024px) {
  .btn {
    border: none;
    background: #00bd7e;
    color: #fff;
    padding: 0.25rem 1.5rem;
    font-size: 1rem;
    border-radius: 0.25rem;
    display: block;
    margin: 2rem auto 0;
    cursor: pointer;
  }
  .login {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-self: center;

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
}
</style>
