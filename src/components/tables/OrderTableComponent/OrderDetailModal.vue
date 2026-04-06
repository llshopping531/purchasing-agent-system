<script setup lang="ts">
import BooleanTransformComponent from '@/components/BooleanTransformComponent.vue'
import ModalComponent from '@/components/ModalComponent.vue'
import type { OrderAllContent } from '@/services/api/order/order-api'

defineProps<{
  order: OrderAllContent
  extraFields: { name: string; value: string }[]
}>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <modal-component
    name="訂單詳細資料"
    width="600px"
    @confirm="emit('close')"
    @cancel="emit('close')"
  >
    <template #content>
      <div class="detail-grid">
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">購買者</span>
            <span class="detail-value">{{ order.customerName }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">品項</span>
            <span class="detail-value">{{ order.productName }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">數量</span>
            <span class="detail-value">{{ order.quantity }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">訂單狀態</span>
            <span class="detail-value">{{ order.orderStatusName }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">匯率</span>
            <span class="detail-value">{{ order.exchangeRate }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">小計 (日幣)</span>
            <span class="detail-value">{{ order.subtotalJpy }} JPY</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">小計 (台幣)</span>
            <span class="detail-value">{{ order.subtotalTwd }} TWD</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">採購者</span>
            <span class="detail-value">{{ order.purchaserName }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">通路</span>
            <span class="detail-value">{{ order.channelName }}</span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">非特典對象</span>
            <span class="detail-value">
              <boolean-transform-component :value="order.nonBonusTarget" />
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">固定匯率</span>
            <span class="detail-value">
              <boolean-transform-component :value="order.isFixedRate" />
            </span>
          </div>
        </div>
        <div class="detail-line">
          <div class="detail-row">
            <span class="detail-label">非分潤對象</span>
            <span class="detail-value">
              <boolean-transform-component :value="order.nonCutTarget" />
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">採購確認</span>
            <span class="detail-value">
              <boolean-transform-component :value="order.purchaseConfirm" />
            </span>
          </div>
        </div>
        <template v-for="(_, i) in Math.ceil(extraFields.length / 2)" :key="i">
          <div class="detail-line">
            <div
              class="detail-row"
              v-for="field in extraFields.slice(i * 2, i * 2 + 2)"
              :key="field.value"
            >
              <span class="detail-label">{{ field.name }}</span>
              <span class="detail-value">{{ (order as any)[field.value] }}</span>
            </div>
          </div>
        </template>
      </div>
    </template>
  </modal-component>
</template>

<style scoped>
.detail-grid {
  padding: 1rem 0.5rem;
  .detail-line {
    display: flex;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }
  .detail-row {
    flex: 1;
    display: flex;
    gap: 0.25rem;
    font-size: 14px;
    .detail-label {
      width: 90px;
      flex-shrink: 0;
      background-color: var(--color-primary);
      color: #fff;
      padding: 0.25rem 0.5rem;
      text-align: center;
    }
    .detail-value {
      flex: 1;
      background-color: #fff;
      padding: 0.25rem 0.5rem;
    }
  }
}
</style>
