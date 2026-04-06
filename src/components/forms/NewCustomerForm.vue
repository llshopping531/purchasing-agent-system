<script setup lang="ts">
import TextInput from '@/components/inputs/TextInput.vue'

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
  <label class="checkboxLabel"><input type="checkbox" v-model="hasMessagedOfficial" /> 已私訊官方</label>
  <label class="checkboxLabel"><input type="checkbox" v-model="isDiscount" /> 優惠對象</label>
  <label class="checkboxLabel"><input type="checkbox" v-model="isBoss" /> 老闆</label>
  <text-input label="備註" v-model:value="note" />
</template>

<style scoped>
.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
