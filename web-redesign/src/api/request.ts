import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

request.interceptors.response.use(
  (response) => {
    const contentType = String(response.headers?.['content-type'] || '')
    const payload = response.data

    if (typeof payload === 'string' || contentType.includes('text/html')) {
      const error = new Error('接口返回了 HTML 页面，请检查前端代理地址是否指向正确的后端服务')
      ;(error as Error & { code?: string }).code = 'INVALID_API_TARGET'
      return Promise.reject(error)
    }

    if (payload && typeof payload === 'object' && 'code' in payload) {
      return payload
    }

    const error = new Error('接口返回格式不符合预期，请检查后端返回结构')
    ;(error as Error & { code?: string }).code = 'INVALID_API_PAYLOAD'
    return Promise.reject(error)
  },
  (error) => {
    const message = error?.response?.data?.message || error?.message || '请求失败'
    if (!error.config?.silent) {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  },
)

export default request
