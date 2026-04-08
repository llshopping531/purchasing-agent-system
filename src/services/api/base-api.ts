import { useErrorStore } from '@/stores/error'
import { useLoadingStore } from '@/stores/loading'
import { useUserStore } from '@/stores/user'
import type { AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'

/**
 * 後端統一回應格式
 * @template T - data 欄位的實際型別
 */
interface BaseApiRes<T> {
  /** HTTP 業務狀態碼 */
  code: number
  /** 回應訊息 */
  message: string
  /** 實際資料內容 */
  data: T
}

/** 全域 loading store 實例，用於在請求期間顯示載入遮罩 */
const loadingStore = useLoadingStore()
/** 全域 error store 實例，用於顯示 API 錯誤彈窗 */
const errorStore = useErrorStore()

/** axios 實例，統一設定 baseURL 與 timeout */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

/**
 * 發送 GET 請求
 * @template resT - 回應資料型別
 * @template reqT - 查詢參數型別
 * @param url - API 路徑
 * @param req - 查詢參數（轉為 query string）
 * @returns 解包後的資料
 */
export const getApi = async <resT, reqT>(url: string, req?: reqT): Promise<resT> => {
  loadingStore.open()
  const res = await api.get<BaseApiRes<resT>>(url, { params: req })
  loadingStore.close()
  if (res.data.code !== 200) { errorStore.show(res.data.message); throw new Error(res.data.message) }
  return res.data.data
}

/**
 * 發送 POST 請求
 * @template resT - 回應資料型別
 * @template reqT - 請求 body 型別
 * @param url - API 路徑
 * @param req - 請求 body
 * @returns 解包後的資料
 */
export const postApi = async <resT, reqT>(url: string, req: reqT): Promise<resT> => {
  loadingStore.open()
  const res = await api.post<BaseApiRes<resT>>(url, req)
  loadingStore.close()
  if (res.data.code !== 200) { errorStore.show(res.data.message); throw new Error(res.data.message) }
  return res.data.data
}

/**
 * 發送 PATCH 請求
 * @template resT - 回應資料型別
 * @template reqT - 請求 body 型別
 * @template paramsT - URL 路徑參數型別
 * @param url - API 路徑（含 ID 的完整路徑）
 * @param req - 請求 body
 * @param params - 額外的 query 參數
 * @returns 解包後的資料
 */
export const patchApi = async <resT, reqT, paramsT>(
  url: string,
  req?: reqT,
  params?: paramsT,
): Promise<resT> => {
  loadingStore.open()
  const res = await api.patch<BaseApiRes<resT>>(url, req, { params: params })
  loadingStore.close()
  if (res.data.code !== 200) { errorStore.show(res.data.message); throw new Error(res.data.message) }
  return res.data.data
}

/**
 * 發送 DELETE 請求
 * @template resT - 回應資料型別
 * @template paramsT - URL 路徑參數型別
 * @param url - API 路徑（含 ID 的完整路徑）
 * @param params - 額外的 query 參數
 * @returns 解包後的資料
 */
export const deleteApi = async <resT, paramsT>(url: string, params?: paramsT): Promise<resT> => {
  loadingStore.open()
  const res = await api.delete<BaseApiRes<resT>>(url, { params: params })
  loadingStore.close()
  if (res.data.code !== 200) { errorStore.show(res.data.message); throw new Error(res.data.message) }
  return res.data.data
}

// 請求攔截器：自動附加 Authorization Token
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    config.headers = {
      ...config.headers,
      Authorization: userStore.isLogin ? `Bearer ${localStorage.getItem('token')}` : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    return config
  },
  (error) => Promise.reject(error),
)

// 回應攔截器：統一錯誤處理，401 時自動登出並導向登入頁
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
