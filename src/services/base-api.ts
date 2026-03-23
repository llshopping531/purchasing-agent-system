import { useUserStore } from '@/stores/user'
import type { AxiosInstance, AxiosResponse } from 'axios'
import axios from 'axios'
interface BaseApiRes<T> {
  code: number
  message: string
  data: T
}
// 建立 axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

export const getApi = async <resT, reqT>(url: string, req?: reqT): Promise<resT> => {
  const res = await api.get<BaseApiRes<resT>>(url, { params: req })
  return res.data.data
}

export const postApi = async <resT, reqT>(url: string, req: reqT): Promise<resT> => {
  const res = await api.post<BaseApiRes<resT>>(url, req)
  return res.data.data
}

export const patchApi = async <resT, reqT, paramsT>(url: string, req?: reqT, params?: paramsT): Promise<resT> => {
  const res = await api.patch<BaseApiRes<resT>>(url, req, { params: params })
  return res.data.data
}

export const deleteApi = async <resT, paramsT>(url: string, params?: paramsT): Promise<resT> => {
  const res = await api.delete<BaseApiRes<resT>>(url, { params: params })
  return res.data.data
}

// 請求攔截器 (加 token)
api.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    // 使用 axios 提供的 setHeaders 方法
    config.headers = {
      ...config.headers,
      Authorization: userStore.isLogin ? `Bearer ${localStorage.getItem('token')}` : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    return config
  },
  (error) => Promise.reject(error),
)

// 回應攔截器 (統一錯誤處理)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // 例如 401 自動登出
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
