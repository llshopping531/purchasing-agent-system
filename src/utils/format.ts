/**
 * 格式化台幣金額：加千分位逗號並補 $ 前綴
 * null / undefined / '-' 回傳 '-'
 */
export function formatTwd(val: number | string | null | undefined): string {
  if (val == null || val === '' || String(val) === '-') return '—'
  const num = Number(val)
  if (isNaN(num)) return '-'
  return `$ ${num.toLocaleString()}`
}

/**
 * 格式化日幣金額：加千分位逗號並補 ¥ 前綴
 * null / undefined 回傳 '-'
 */
export function formatJpy(val: number | null | undefined): string {
  if (val == null) return '-'
  return `¥ ${val.toLocaleString()}`
}
