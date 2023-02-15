import { createApp } from 'vue'
import '@/style/index.scss'
import App from './App.vue'
import router from '@/router/index.ts'
import { createPinia } from 'pinia'
const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
