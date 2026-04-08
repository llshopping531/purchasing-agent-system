/**
 * 全域 Modal 層級管理
 * 每個 modal 掛載時取得遞增的 z-index 層，卸載時歸還，
 * 並在有任何 modal 存在時鎖定頁面滾動。
 */

let activeCount = 0
const BASE_Z = 200
const STEP = 10

function acquire() {
  activeCount++
  document.documentElement.classList.add('no-scroll')
  const layer = activeCount
  return {
    maskZ: BASE_Z + (layer - 1) * STEP,
    modalZ: BASE_Z + (layer - 1) * STEP + 1,
  }
}

function release() {
  activeCount = Math.max(0, activeCount - 1)
  if (activeCount === 0) {
    document.documentElement.classList.remove('no-scroll')
  }
}

export function useModalLayer() {
  return { acquire, release }
}
