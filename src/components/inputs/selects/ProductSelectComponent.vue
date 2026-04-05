<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Option } from '@/interfaces/common'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'
import SelectComponent from '@/components/inputs/SelectComponent.vue'
import { productsApi } from '@/services/api/products/products-api'

const props = defineProps<{
  eventId: string
  channelId: string
  defaultValue?: Option
}>()

const emit = defineEmits<{
  (e: 'selectOption', data: Option): void
  (e: 'selectProduct', data: ProductsResBase): void
}>()

const fullProductList = ref<ProductsResBase[]>([])
const productOptions = ref<Option[]>([])

watch(
  [() => props.eventId, () => props.channelId],
  ([newEventId, newChannelId]) => {
    if (newEventId && newChannelId) {
      getProductList(newEventId, newChannelId)
    }
  },
  { immediate: true },
)

async function getProductList(eventId: string, channelId: string) {
  const res = await productsApi.getProductsAll({
    eventId: Number(eventId),
    channelId: Number(channelId),
  })
  fullProductList.value = res
  productOptions.value = res.map((p) => ({
    name: p.name,
    value: p.id.toString(),
  }))
}

function onSelect(option: Option) {
  emit('selectOption', option)
  const product = fullProductList.value.find((p) => p.id.toString() === option.value)
  if (product) emit('selectProduct', product)
}
</script>

<template>
  <select-component
    label="商品"
    :optionList="productOptions"
    :defaultValue="defaultValue"
    @selectOption="onSelect"
  />
</template>
