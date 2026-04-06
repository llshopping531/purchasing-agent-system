<script setup lang="ts">
import TextInput from '@/components/inputs/TextInput.vue'
import PriceRateInputComponent from '@/components/inputs/PriceRateInputComponent.vue'

const name = defineModel<string>('name', { default: '' })
const priceJpy = defineModel<number | null>('priceJpy')
const exchangeRate = defineModel<number | null>('exchangeRate')
const priceTwd = defineModel<number | null>('priceTwd')
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
