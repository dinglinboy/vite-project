import { createApp } from 'vue'
import '@/style/index.scss'
import 'element-plus/es/components/message/style/css'
import App from './App.vue'
import router from '@/router/index'
import { createPinia } from 'pinia'
const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
