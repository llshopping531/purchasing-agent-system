<script setup lang="ts">
/**
 * 新增商品表單
 * 以 defineModel 方式將各欄位雙向綁定至父層，
 * 日幣定價 / 匯率 / 台幣定價 由 PriceRateInputComponent 處理聯動計算
 */
import TextInput from '@/components/inputs/TextInput.vue'
import PriceRateInputComponent from '@/components/inputs/PriceRateInputComponent.vue'

/** 商品名稱 */
const name = defineModel<string>('name', { default: '' })
/** 日幣定價 */
const priceJpy = defineModel<number | null>('priceJpy')
/** 匯率 */
const exchangeRate = defineModel<number | null>('exchangeRate')
/** 台幣定價（由 PriceRateInputComponent 與日幣定價、匯率聯動） */
const priceTwd = defineModel<number | null>('priceTwd')
/** 商品圖片 URL */
const image = defineModel<string>('image', { default: '' })
</script>

<template>
  <text-input label="商品名稱" v-model:value="name" />
  <price-rate-input-component
    v-model:priceJpy="priceJpy"
    v-model:exchangeRate="exchangeRate"
    v-model:priceTwd="priceTwd"
  />
  <text-input label="商品圖片" v-model:value="image" />
</template>
