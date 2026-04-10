<script setup lang="ts">
/**
 * 新增商品表單
 * 以 defineModel 方式將各欄位雙向綁定至父層，
 * 日幣定價 / 匯率 / 台幣定價 由 PriceRateInputComponent 處理聯動計算
 */
import TextInput from '@/components/inputs/TextInput.vue'
import PriceRateInputComponent from '@/components/inputs/PriceRateInputComponent.vue'

defineProps<{
  /** 欄位驗證錯誤訊息 */
  errors?: Partial<Record<'name' | 'priceJpy' | 'exchangeRate' | 'priceTwd' | 'image', string>>
}>()

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
  <div class="new-product-from">
    <text-input label="商品名稱" v-model:value="name" required :error-message="errors?.name" />
    <price-rate-input-component
      v-model:priceJpy="priceJpy"
      v-model:exchangeRate="exchangeRate"
      v-model:priceTwd="priceTwd"
      :priceJpyError="errors?.priceJpy"
      :exchangeRateError="errors?.exchangeRate"
      :priceTwdError="errors?.priceTwd"
    />
    <text-input label="商品圖片" v-model:value="image" :error-message="errors?.image" />
  </div>
</template>
<style>
.new-product-from {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  .label {
    min-width: calc(50% - 0.5rem);
    @media (max-width: 768px) {
      width: 100%;
    }
  }
}
</style>
