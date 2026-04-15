import type { ThreadsExchangeTokenRes, ThreadsItem, ThreadsListRes } from './threads-api-interfaces'

const THREADS_API_BASE = 'https://graph.threads.net/v1.0'

/** 自動跟隨 paging.next，一次撈完所有分頁資料 */
async function fetchAllPages(firstUrl: string): Promise<ThreadsItem[]> {
  const result: ThreadsItem[] = []
  let nextUrl: string | undefined = firstUrl

  while (nextUrl) {
    const res = await fetch(nextUrl)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    const json: ThreadsListRes = await res.json()
    result.push(...(json.data ?? []))
    nextUrl = json.paging?.next
  }

  return result
}

export const threadsApi = {
  /**
   * 查詢帳號自己的所有貼文
   * @param accessToken - Threads Graph API 存取金鑰
   */
  getThreads: async (accessToken: string): Promise<ThreadsItem[]> => {
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,media_product_type,media_type,media_url,permalink,username,text,topic_tag,timestamp,shortcode,thumbnail_url,children,is_quote_post,has_replies,root_post,replied_to,is_reply,is_reply_owned_by_me,reply_audience',
      format: 'json',
    })
    return fetchAllPages(`${THREADS_API_BASE}/me/threads?${params.toString()}`)
  },

  /**
   * 查詢指定貼文底下的留言
   * @param postId - 貼文 ID
   * @param accessToken - Threads Graph API 存取金鑰
   */
  getPostReplies: async (postId: string, accessToken: string): Promise<ThreadsItem[]> => {
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,media_product_type,media_type,media_url,permalink,username,text,topic_tag,timestamp,shortcode,thumbnail_url,children,is_quote_post,has_replies,root_post,replied_to,is_reply,is_reply_owned_by_me,reply_audience',
      format: 'json',
    })
    return fetchAllPages(`${THREADS_API_BASE}/${postId}/replies?${params.toString()}`)
  },

  /**
   * 查詢帳號收到的所有留言 (replies)
   * @param accessToken - Threads Graph API 存取金鑰
   */
  getReplies: async (accessToken: string): Promise<ThreadsItem[]> => {
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: 'id,text,username,media_url,permalink',
      format: 'json',
    })
    return fetchAllPages(`${THREADS_API_BASE}/me/replies?${params.toString()}`)
  },

  /**
   * 將短期 Token 兌換為長期 Token（有效期約 60 天）
   * @param shortToken - 現有的短期 Access Token
   * @param appSecret - Meta 開發者應用程式的 App Secret
   */
  exchangeLongLivedToken: async (
    shortToken: string,
    appSecret: string,
  ): Promise<ThreadsExchangeTokenRes> => {
    const params = new URLSearchParams({
      grant_type: 'th_exchange_token',
      client_secret: appSecret,
      access_token: shortToken,
    })
    const res = await fetch(`${THREADS_API_BASE.replace('/v1.0', '')}/access_token?${params.toString()}`)
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    const json = await res.json()
    if (json.error) {
      throw new Error(json.error.message ?? '兌換失敗')
    }
    return json as ThreadsExchangeTokenRes
  },
}
