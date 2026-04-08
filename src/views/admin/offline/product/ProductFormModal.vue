<script setup lang="ts">
/**
 * 商品新增／編輯／刪除彈窗
 * 透過 defineExpose 提供 createProduct / editProduct / deleteProduct 方法供父層呼叫
 * 操作完成後 emit confirmed 通知父層重新載入商品列表
 */
import { ref } from 'vue'
import { useForm } from 'vee-validate'
import * as yup from 'yup'
import ConfirmModalComponent from '@/components/ConfirmModalComponent.vue'
import NewProductForm from '@/components/forms/NewProductForm.vue'
import { productsApi } from '@/services/api/products/products-api'
import type { ProductsResBase } from '@/services/api/products/products-api-interfaces'

const props = defineProps<{
  /** 目前選取的活動 ID（字串形式） */
  eventId: string
  /** 目前選取的通路 ID（字串形式） */
  shopId: string
}>()

const emit = defineEmits<{
  /** 新增、修改或刪除成功後觸發，通知父層重新整理商品列表 */
  (e: 'confirmed'): void
}>()

/** 彈窗是否顯示 */
const isVisible = ref(false)
/** 操作模式：1 = 新增，2 = 修改，3 = 刪除 */
const modalMode = ref<1 | 2 | 3>(1)
/** 目標商品 ID */
const currentId = ref(0)
/** 刪除確認時顯示的商品名稱 */
const currentName = ref('')

const schema = yup.object({
  name: yup.string().required('商品名稱為必填'),
  priceJpy: yup
    .number()
    .typeError('請輸入數字')
    .required('日幣定價為必填')
    .positive('請輸入正數'),
  exchangeRate: yup
    .number()
    .typeError('請輸入數字')
    .required('匯率為必填')
    .positive('請輸入正數'),
  priceTwd: yup
    .number()
    .typeError('請輸入數字')
    .required('台幣定價為必填')
    .positive('請輸入正數'),
})

const { defineField, errors, validate, resetForm } = useForm({
  validationSchema: schema,
  initialValues: { name: '', priceJpy: null as number | null, exchangeRate: null as number | null, priceTwd: null as number | null },
})

const [name] = defineField('name')
const [priceJpy] = defineField('priceJpy')
const [exchangeRate] = defineField('exchangeRate')
const [priceTwd] = defineField('priceTwd')

/** 表單欄位：商品圖片 URL */
const image = ref('')

/**
 * 開啟新增商品彈窗
 */
function createProduct() {
  modalMode.value = 1
  resetForm()
  isVisible.value = true
}

/**
 * 開啟編輯商品彈窗，並將現有資料填入表單
 * @param data - 要編輯的商品資料
 */
function editProduct(data: ProductsResBase) {
  modalMode.value = 2
  currentId.value = data.id
  resetForm({
    values: {
      name: data.name,
      priceJpy: Number(data.priceJpy),
      exchangeRate: Number(data.exchangeRate),
      priceTwd: Number(data.priceTwd),
    },
  })
  image.value = data.image
  isVisible.value = true
}

/**
 * 開啟刪除商品確認彈窗
 * @param data - 要刪除的商品資料
 */
function deleteProduct(data: ProductsResBase) {
  modalMode.value = 3
  currentId.value = data.id
  currentName.value = data.name
  isVisible.value = true
}

/**
 * 點擊確定前執行驗證，刪除模式跳過驗證
 */
async function beforeConfirm(): Promise<boolean> {
  if (modalMode.value === 3) return true
  const { valid } = await validate()
  return valid
}

/**
 * 執行新增、修改或刪除 API，成功後關閉彈窗並通知父層
 */
async function confirm() {
  if (modalMode.value === 1 || modalMode.value === 2) {
    const req = {
      eventId: Number(props.eventId),
      channelId: Number(props.shopId),
      name: name.value ?? '',
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

/**
 * 關閉彈窗並重置所有表單欄位
 */
function closeModal() {
  currentId.value = 0
  currentName.value = ''
  resetForm()
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
    :beforeConfirm="beforeConfirm"
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
          :errors="errors"
        />
      </div>
    </template>
  </confirm-modal-component>
</template>

<style scoped>
.formGrid {
  display: flex;
  gap: 1.5rem;
  padding: 0 0.5rem;
  flex-wrap: wrap;
  align-items: start;
  margin-top: 1rem;
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
}
</style>
