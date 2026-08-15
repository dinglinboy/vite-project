import { createApp } from 'vue'
import '@/style/index.scss'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
import App from './App.vue'
import router from '@/router/index'
import { createPinia } from 'pinia'
import permissionDirective from '@/directives/permission'

const app = createApp(App)
// 注意顺序：先装 pinia（路由守卫/指令里会用到 store）
app.use(createPinia())
app.use(router)
app.directive('permission', permissionDirective)
app.mount('#app')
