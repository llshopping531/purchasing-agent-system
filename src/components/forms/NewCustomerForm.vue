<script setup lang="ts">
import TextInput from '@/components/inputs/TextInput.vue'
import CheckboxInput from '@/components/inputs/CheckboxInput.vue'

const name = defineModel<string>('name', { default: '' })
const source = defineModel<string>('source', { default: '' })
const hasMessagedOfficial = defineModel<boolean>('hasMessagedOfficial', { default: false })
const isDiscount = defineModel<boolean>('isDiscount', { default: false })
const isBoss = defineModel<boolean>('isBoss', { default: false })
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
