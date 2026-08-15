import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
    clearJwtToken,
    clearUserInfo,
    clearLoginToken,
    getJwtToken
} from '@/util/util'
import router from '@/router/index'
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 30000
})

// Add a request interceptor
instance.interceptors.request.use(
    function (config) {
        const jwtToken = getJwtToken()
        if (jwtToken) {
            config.headers.Authorization = 'Bearer ' + jwtToken
        }
        // Do something before request is sent
        return config
    },
    function (error) {
        // Do something with request error
        return Promise.reject(error)
    }
)

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data
        return response.data || {}
    },
    function (error) {
        if (error.response && error.response.status === 401) {
            // token 失效：清除本地登录态后跳转登录页
            // push()会产生历史记录 而replace不会有历史记录
            clearJwtToken()
            clearUserInfo()
            clearLoginToken()
            router.replace('/login')
        }
        if (error.response && error.response.status === 403) {
            ElMessage.error(
                error.response.data?.message || '没有访问权限，请联系管理员'
            )
        }
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error)
    }
)
export default instance
