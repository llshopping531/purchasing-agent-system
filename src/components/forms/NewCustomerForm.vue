<script setup lang="ts">
/**
 * 新增顧客表單
 * 以 defineModel 方式將各欄位雙向綁定至父層，
 * 可同時用於新增與編輯顧客的彈窗
 */
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'

/** 顧客名稱 */
const name = defineModel<string>('name', { default: '' })
/** 來源（例如社群平台） */
const source = defineModel<string>('source', { default: '' })
/** 是否已私訊官方帳號 */
const hasMessagedOfficial = defineModel<boolean>('hasMessagedOfficial', { default: false })
/** 是否享有折扣優惠 */
const isDiscount = defineModel<boolean>('isDiscount', { default: false })
/** 是否為老闆（特殊身分） */
const isBoss = defineModel<boolean>('isBoss', { default: false })
/** 備註 */
const note = defineModel<string>('note', { default: '' })
</script>

<template>
  <text-input label="顧客名稱" v-model:value="name" />
  <text-input label="來源" v-model:value="source" />
  <checkbox-input label="已私訊官方" v-model="hasMessagedOfficial" />
  <checkbox-input label="優惠對象" v-model="isDiscount" />
  <checkbox-input label="老闆" v-model="isBoss" />
  <text-input label="備註" v-model:value="note" />
</template>
