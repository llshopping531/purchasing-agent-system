<script setup lang="ts">
import { ref } from 'vue'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import NewProductForm from '@/components/forms/NewProductForm.vue'
import { productsApi } from '@/services/api/products/products-api'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'

const props = defineProps<{ eventId: string; shopId: string }>()
const emit = defineEmits<{ (e: 'confirmed'): void }>()

const isVisible = ref(false)
// 1新增 2修改 3刪除
const modalMode = ref<1 | 2 | 3>(1)
const currentId = ref(0)
const currentName = ref('')

const name = ref('')
const priceJpy = ref<number | null>(null)
const exchangeRate = ref<number | null>(null)
const priceTwd = ref<number | null>(null)
const image = ref('')

function createProduct() {
  modalMode.value = 1
  isVisible.value = true
}

function editProduct(data: ProductsResBase) {
  modalMode.value = 2
  currentId.value = data.id
  name.value = data.name
  priceJpy.value = data.priceJpy
  exchangeRate.value = data.exchangeRate
  priceTwd.value = data.priceTwd
  image.value = data.image
  isVisible.value = true
}

function deleteProduct(data: ProductsResBase) {
  modalMode.value = 3
  currentId.value = data.id
  currentName.value = data.name
  isVisible.value = true
}

async function confirm() {
  if (modalMode.value === 1 || modalMode.value === 2) {
    const req = {
      eventId: Number(props.eventId),
      channelId: Number(props.shopId),
      name: name.value,
      priceJpy: priceJpy.value ?? 0,
      exchangeRate: exchangeRate.value ?? 0,
      priceTwd: priceTwd.value ?? 0,
      image: image.value,
    }
    if (modalMode.value === 1) await productsApi.postProducts(req)
    if (modalMode.value === 2) await productsApi.patchProducts(currentId.value, req)
  }
  if (modalMode.value === 3) await productsApi.deleteProducts(currentId.value)
  closeModal()
  emit('confirmed')
}

function closeModal() {
  currentId.value = 0
  currentName.value = ''
  name.value = ''
  priceJpy.value = null
  exchangeRate.value = null
  priceTwd.value = null
  image.value = ''
  isVisible.value = false
}

defineExpose({ createProduct, editProduct, deleteProduct })
</script>

<template>
  <confirm-modal-component
    v-if="isVisible"
    :name="modalMode === 1 ? '新增商品' : '編輯商品'"
    :confirmText="
      modalMode === 3
        ? `您確定要刪除「${currentName}」嗎？`
        : modalMode === 1
          ? '您確定要新增此商品嗎？'
          : '您確定要修改此商品嗎？'
    "
    :isDelete="modalMode === 3"
    width="500px"
    @cancel="closeModal"
    @confirm="confirm"
  >
    <template #content>
      <div v-if="modalMode !== 3" class="formGrid">
        <new-product-form
          v-model:name="name"
          v-model:priceJpy="priceJpy"
          v-model:exchangeRate="exchangeRate"
          v-model:priceTwd="priceTwd"
          v-model:image="image"
        />
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1.5rem;
  padding: 0 0.5rem;
}
</style>
