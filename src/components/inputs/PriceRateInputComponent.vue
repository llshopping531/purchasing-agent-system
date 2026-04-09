<script setup lang="ts">
/**
 * 日幣定價 / 匯率 / 台幣定價 聯動輸入元件
 * 三個欄位互相連動：失焦時依「最後編輯的欄位」自動計算第三個
 * - 台幣定價 = 日幣定價 × 匯率，並進位至最近的 5 元
 * - 更動台幣定價時，反推匯率（保留 2 位小數）
 */
import TextInput from '@/components/inputs/TextInput.vue'

defineProps<{
  /** 日幣定價驗證錯誤訊息 */
  priceJpyError?: string
  /** 匯率驗證錯誤訊息 */
  exchangeRateError?: string
  /** 台幣定價驗證錯誤訊息 */
  priceTwdError?: string
}>()

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

/** 日幣定價失焦：重新計算台幣定價 */
function onBlurJpy() {
  if (!priceJpy.value || !exchangeRate.value) return
  priceTwd.value = calcPriceTwd(priceJpy.value, exchangeRate.value)
}

/** 匯率失焦：重新計算台幣定價 */
function onBlurRate() {
  if (!exchangeRate.value || !priceJpy.value) return
  priceTwd.value = calcPriceTwd(priceJpy.value, exchangeRate.value)
}

/** 台幣定價失焦：反推匯率 */
function onBlurTwd() {
  if (!priceTwd.value || !priceJpy.value) return
  exchangeRate.value = parseFloat((priceTwd.value / priceJpy.value).toFixed(2))
}
</script>

<template>
  <text-input label="日幣定價" v-model:value="priceJpy"  :error-message="priceJpyError" @blur="onBlurJpy" />
  <text-input label="匯率" v-model:value="exchangeRate"  :error-message="exchangeRateError" @blur="onBlurRate" />
  <text-input label="台幣定價" v-model:value="priceTwd"  :error-message="priceTwdError" @blur="onBlurTwd" />
</template>
