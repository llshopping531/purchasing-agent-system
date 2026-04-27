/** Threads 資料項目（貼文 / 留言共用相同欄位） */
export interface ThreadsItem {
  id: string
  text: string
  username: string
  media_url?: string
  permalink?: string
}

/** Threads Graph API 分頁回應格式 */
export interface ThreadsListRes {
  data: ThreadsItem[]
  paging?: {
    cursors?: { before: string; after: string }
    next?: string
  }
}

/** 長期 Token 兌換回應 */
export interface ThreadsExchangeTokenRes {
  access_token: string
  token_type: string
  /** 有效秒數 */
  expires_in: number
}

// 向下相容舊名稱
export type ThreadsReply = ThreadsItem
export type ThreadsRepliesRes = ThreadsListRes
