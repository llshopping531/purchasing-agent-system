<script setup lang="ts">
import { watch } from 'vue'
import TextInput from '@/components/inputs/TextInput.vue'

const priceJpy = defineModel<number | null>('priceJpy')
const exchangeRate = defineModel<number | null>('exchangeRate')
const priceTwd = defineModel<number | null>('priceTwd')

function calcPriceTwd(jpy: number, rate: number): number {
  const price = jpy * rate
  const floored = Math.floor(price)
  return floored % 5 === 0 ? floored : Math.ceil(price / 5) * 5
}

let syncing = false

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
