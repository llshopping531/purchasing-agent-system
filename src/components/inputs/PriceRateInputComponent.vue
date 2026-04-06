<script setup lang="ts">
/**
 * 日幣定價 / 匯率 / 台幣定價 聯動輸入元件
 * 三個欄位互相連動：更動其中任兩個時，自動計算第三個
 * - 台幣定價 = 日幣定價 × 匯率，並進位至最近的 5 元
 * - 更動台幣定價時，反推匯率（保留 4 位小數）
 */
import { watch } from 'vue'
import TextInput from '@/components/inputs/TextInput.vue'

/** 日幣定價（雙向綁定） */
const priceJpy = defineModel<number | null>('priceJpy')
/** 匯率（雙向綁定） */
const exchangeRate = defineModel<number | null>('exchangeRate')
/** 台幣定價（雙向綁定） */
const priceTwd = defineModel<number | null>('priceTwd')

/**
 * 將日幣金額依匯率換算為台幣，並進位至最近的 5 元
 * @param jpy - 日幣金額
 * @param rate - 匯率
 * @returns 進位後的台幣金額
 */
function calcPriceTwd(jpy: number, rate: number): number {
  const price = jpy * rate
  const floored = Math.floor(price)
  return floored % 5 === 0 ? floored : Math.ceil(price / 5) * 5
}

/** 防止三個 watch 循環觸發的 flag */
let syncing = false

// 日幣定價變動時，重新計算台幣定價
watch(
  () => priceJpy.value,
  (jpy) => {
    if (syncing || !jpy || !exchangeRate.value) return
    syncing = true
    priceTwd.value = calcPriceTwd(jpy, exchangeRate.value)
    syncing = false
  },
  { flush: 'sync' },
)

// 匯率變動時，重新計算台幣定價
watch(
  () => exchangeRate.value,
  (rate) => {
    if (syncing || !rate || !priceJpy.value) return
    syncing = true
    priceTwd.value = calcPriceTwd(priceJpy.value, rate)
    syncing = false
  },
  { flush: 'sync' },
)

// 台幣定價變動時，反推匯率
watch(
  () => priceTwd.value,
  (twd) => {
    if (syncing || !twd || !priceJpy.value) return
    syncing = true
    exchangeRate.value = parseFloat((twd / priceJpy.value).toFixed(4))
    syncing = false
  },
  { flush: 'sync' },
)
</script>

<template>
  <text-input label="日幣定價" v-model:value="priceJpy" />
  <text-input label="匯率" v-model:value="exchangeRate" />
  <text-input label="台幣定價" v-model:value="priceTwd" />
</template>
