/** 顧客來源 source 值對應的短標籤（用於小徽章顯示） */
export const SOURCE_LABELS: Record<string, string> = {
  '1': 'L',
  '2': 'F',
  '3': 'T',
}

/** 顧客來源 source 值對應的品牌顏色 */
export const SOURCE_COLORS: Record<string, string> = {
  '1': '#06c755',
  '2': '#1877f2',
  '3': '#000',
}

export const SOCIAL_DEFAULT_TEMPLATE = `#場販 #\${EventName} \${channelName}
4/22-4/28連線

(emoji)商品(emoji)
\${productName} \${productPrice}

(pizza)記事本喊單，商品若有限購按照喊單順序(pizza)

單次喊單滿日幣\${minJpy}可獲得隨機特典一枚
(emoji) 發完為止，若數量不足以消費金額較高者優先

∞----------------------------𓏲𓎨ෆ -
(emoji) 喊單前請先私訊官方帳號回報社群名稱
✿ 依照留言順序，確認購買會按貼圖
✿ 盲抽可代拆，留言時請備註代拆，且默認廠損
✿ 結單後不接受取消，喊單前請慎重考慮
✿ 依現場貨量為主，有可能缺貨，無缺A pass B
✿ 若有任何問題歡迎私訊官方
`
