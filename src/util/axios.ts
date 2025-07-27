import axios from 'axios'
import { getJwtToken } from '@/util/util'
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
            // token续签方式1:
            //清空当前vuex保存的token（我们这的vuex和本地已经建立了关系，相当于也清空了本地token）
            // push()会产生历史记录 而replace不会有历史记录
            router.push('/login')
        }
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error)
    }
)
export default instance
