<script setup lang="ts">
/**
 * 日期選擇器元件
 * v-model:value 雙向綁定，輸出格式 yyyy-MM-dd
 */
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps<{
  label: string
  required?: boolean
  errorMessage?: string
  disabled?: boolean
  placeholder?: string
}>()

const value = defineModel<string>('value')

const isOpen = ref(false)
const displayYear = ref(new Date().getFullYear())
const displayMonth = ref(new Date().getMonth())
const wrapperRef = ref<HTMLElement>()
const calendarRef = ref<HTMLElement>()
const calendarStyle = ref({ top: '0px', left: '0px' })

function updateCalendarPosition() {
  if (!wrapperRef.value) return
  const rect = wrapperRef.value.getBoundingClientRect()
  const calendarHeight = 300
  const spaceBelow = window.innerHeight - rect.bottom
  const top = spaceBelow >= calendarHeight ? rect.bottom + 6 : rect.top - calendarHeight - 6
  calendarStyle.value = {
    top: `${top}px`,
    left: `${rect.left}px`,
  }
}

const MONTH_NAMES = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月',
]
const DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日']

const daysInMonth = computed(() => new Date(displayYear.value, displayMonth.value + 1, 0).getDate())

/** 週一為第一天的偏移量 */
const startOffset = computed(() => {
  const firstDay = new Date(displayYear.value, displayMonth.value, 1).getDay()
  return (firstDay + 6) % 7
})

const calendarCells = computed(() => {
  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset.value; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth.value; d++) cells.push(d)
  return cells
})

const parsedValue = computed(() => {
  if (!value.value) return null
  const parts = value.value.split('-')
  if (parts.length !== 3) return null
  return {
    year: parseInt(parts[0] ?? ''),
    month: parseInt(parts[1] ?? '') - 1,
    day: parseInt(parts[2] ?? ''),
  }
})

function open() {
  if (props.disabled) return
  if (parsedValue.value) {
    displayYear.value = parsedValue.value.year
    displayMonth.value = parsedValue.value.month
  } else {
    displayYear.value = new Date().getFullYear()
    displayMonth.value = new Date().getMonth()
  }
  isOpen.value = true
  nextTick(updateCalendarPosition)
}

function selectDay(day: number | null) {
  if (!day) return
  const y = displayYear.value
  const m = String(displayMonth.value + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  value.value = `${y}-${m}-${d}`
  isOpen.value = false
}

function prevMonth() {
  if (displayMonth.value === 0) {
    displayMonth.value = 11
    displayYear.value--
  } else displayMonth.value--
}

function nextMonth() {
  if (displayMonth.value === 11) {
    displayMonth.value = 0
    displayYear.value++
  } else displayMonth.value++
}

function prevYear() {
  displayYear.value--
}
function nextYear() {
  displayYear.value++
}

function isToday(day: number | null) {
  if (!day) return false
  const t = new Date()
  return (
    t.getFullYear() === displayYear.value &&
    t.getMonth() === displayMonth.value &&
    t.getDate() === day
  )
}

function isSelected(day: number | null) {
  if (!day || !parsedValue.value) return false
  return (
    parsedValue.value.year === displayYear.value &&
    parsedValue.value.month === displayMonth.value &&
    parsedValue.value.day === day
  )
}

function clearValue(e: Event) {
  e.stopPropagation()
  value.value = ''
}

function selectToday() {
  const t = new Date()
  displayYear.value = t.getFullYear()
  displayMonth.value = t.getMonth()
  selectDay(t.getDate())
}

function onClickOutside(e: MouseEvent) {
  const inWrapper = wrapperRef.value?.contains(e.target as Node)
  const inCalendar = calendarRef.value?.contains(e.target as Node)
  if (!inWrapper && !inCalendar) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  window.addEventListener('scroll', updateCalendarPosition, true)
  window.addEventListener('resize', updateCalendarPosition)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  window.removeEventListener('scroll', updateCalendarPosition, true)
  window.removeEventListener('resize', updateCalendarPosition)
})
</script>

<template>
  <div class="date-input-wrap" ref="wrapperRef">
    <label class="label">
      <span class="title"> {{ label }}<span v-if="required" class="required-mark">*</span> </span>
      <div
        class="input-box"
        :class="{ 'input-error': errorMessage, disabled, active: isOpen }"
        @click="open"
      >
        <span class="input-value" :class="{ placeholder: !value }">
          {{ value || placeholder || '請選擇日期' }}
        </span>
        <span v-if="value && !disabled" class="clear-btn" @click="clearValue">✕</span>
        <svg class="calendar-icon" viewBox="0 0 20 20" fill="none">
          <rect
            x="2"
            y="4"
            width="16"
            height="14"
            rx="2"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path d="M2 8h16" stroke="currentColor" stroke-width="1.5" />
          <path d="M6 2v3M14 2v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </div>
      <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
    </label>

    <!-- 日曆下拉（Teleport 至 body 避免被父層 overflow 截斷） -->
    <Teleport to="body">
      <Transition name="calendar">
        <div v-if="isOpen" class="calendar-dropdown" :style="calendarStyle" ref="calendarRef">
          <!-- 年月導覽 -->
          <div class="cal-header">
            <button class="nav-btn" @click.stop="prevYear" title="上一年">«</button>
            <button class="nav-btn" @click.stop="prevMonth" title="上個月">‹</button>
            <span class="cal-title">{{ displayYear }} 年 {{ MONTH_NAMES[displayMonth] }}</span>
            <button class="nav-btn" @click.stop="nextMonth" title="下個月">›</button>
            <button class="nav-btn" @click.stop="nextYear" title="下一年">»</button>
          </div>

          <!-- 週頭 -->
          <div class="cal-grid">
            <div v-for="d in DAY_NAMES" :key="d" class="day-header">{{ d }}</div>

            <!-- 日期格 -->
            <div
              v-for="(cell, i) in calendarCells"
              :key="i"
              class="day-cell"
              :class="{
                empty: !cell,
                today: isToday(cell),
                selected: isSelected(cell),
              }"
              @click.stop="selectDay(cell)"
            >
              {{ cell ?? '' }}
            </div>
          </div>

          <!-- 今天快捷 -->
          <div class="cal-footer">
            <button class="today-btn" @click.stop="selectToday">今天</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.date-input-wrap {
  position: relative;
  display: block;
}

.label {
  display: block;

  .title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 0.25rem;
    display: block;

    .required-mark {
      color: var(--color-danger, #e53e3e);
      margin-left: 0.2rem;
      font-weight: 700;
    }
  }
}

.input-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  border: 1.5px solid rgba(124, 111, 224, 0.3);
  background: var(--color-surface);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  min-height: 38px;

  &:hover:not(.disabled) {
    border-color: rgba(124, 111, 224, 0.5);
  }

  &.active {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(124, 111, 224, 0.1);
  }

  &.input-error {
    border-color: var(--color-danger, #e53e3e);
    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
  }

  &.disabled {
    background: #f5f3ff;
    color: #aaa;
    cursor: not-allowed;
    border-color: rgba(124, 111, 224, 0.15);
  }
}

.input-value {
  flex: 1;
  font-size: 0.9rem;
  color: var(--color-text-primary, #222);
  letter-spacing: 0.03em;

  &.placeholder {
    color: #bbb;
  }
}

.clear-btn {
  font-size: 0.7rem;
  color: #bbb;
  cursor: pointer;
  line-height: 1;
  padding: 0.1rem 0.2rem;
  border-radius: 50%;
  transition:
    color 0.15s,
    background 0.15s;

  &:hover {
    color: #888;
    background: #f0eeff;
  }
}

.calendar-icon {
  width: 16px;
  height: 16px;
  color: rgba(124, 111, 224, 0.5);
  flex-shrink: 0;
}

.error-message {
  display: block;
  font-size: 0.78rem;
  color: var(--color-danger, #e53e3e);
  margin-top: 0.25rem;
  font-weight: 500;
}

/* 日曆 Dropdown */
.calendar-dropdown {
  position: fixed;
  z-index: 9999;
  background: var(--color-surface);
  border: 1.5px solid rgba(124, 111, 224, 0.2);
  border-radius: var(--radius-lg, 12px);
  box-shadow:
    0 8px 32px rgba(124, 111, 224, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 0.75rem;
  min-width: 260px;
  user-select: none;
}

.cal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  gap: 0.25rem;
}

.cal-title {
  flex: 1;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-primary, #222);
  letter-spacing: 0.02em;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  border-radius: var(--radius-md, 8px);
  font-size: 0.9rem;
  color: var(--color-text-secondary, #666);
  line-height: 1;
  transition:
    background 0.15s,
    color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
  }
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-header {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-muted, #aaa);
  padding: 0.25rem 0;
  letter-spacing: 0.05em;
}

.day-cell {
  text-align: center;
  padding: 0.35rem 0;
  font-size: 0.85rem;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  color: var(--color-text-primary, #333);
  transition:
    background 0.12s,
    color 0.12s;
  line-height: 1.6;

  &:not(.empty):hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    color: var(--color-primary);
  }

  &.empty {
    cursor: default;
  }

  &.today {
    font-weight: 700;
    color: var(--color-primary);

    &:not(.selected)::after {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--color-primary);
      margin: 0 auto;
    }
  }

  &.selected {
    background: var(--color-primary);
    color: #fff;
    font-weight: 700;

    &:hover {
      background: var(--color-primary-dark, #6c5fd5);
      color: #fff;
    }
  }
}

.cal-footer {
  margin-top: 0.6rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(124, 111, 224, 0.1);
  display: flex;
  justify-content: center;
}

.today-btn {
  background: none;
  border: 1.5px solid rgba(124, 111, 224, 0.3);
  border-radius: var(--radius-md, 8px);
  padding: 0.25rem 1rem;
  font-size: 0.8rem;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: 600;
  transition:
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: color-mix(in srgb, var(--color-primary) 8%, transparent);
    border-color: var(--color-primary);
  }
}

/* 動畫 */
.calendar-enter-active,
.calendar-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
