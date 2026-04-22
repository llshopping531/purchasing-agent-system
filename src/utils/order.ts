/**
 * 判斷訂單是否為非有效狀態（已取消 / 缺貨）
 */
export function isInactiveOrder(orderStatusName: string): boolean {
  return orderStatusName === '已取消' || orderStatusName === '缺貨'
}
