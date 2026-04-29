<template>
  <div class="not-found">
    <div class="not-found__card">
      <p class="not-found__code">404</p>
      <p class="not-found__message">找不到頁面</p>
      <p class="not-found__sub">您所瀏覽的頁面不存在或無權限存取。</p>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f6fa;
}

.not-found__card {
  text-align: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 56px 72px;
}

.not-found__code {
  font-size: 96px;
  font-weight: 700;
  color: #d1d5db;
  line-height: 1;
  margin: 0 0 8px;
}

.not-found__message {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px;
}

.not-found__sub {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
}
</style>
