import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()]
        }),
        Components({
            resolvers: [ElementPlusResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    server: {
       proxy: {
           '/prod/api': {
                target: 'http://139.196.236.142', // 后端服务地址
                changeOrigin: true, // 允许跨域
                rewrite: (path) => path.replace(/^\/api/, '') // 重写路径
            },
            '/dev/api': {
                target: 'http://localhost:3000', // 后端服务地址
                changeOrigin: true, // 允许跨域
                rewrite: (path) => path.replace(/^\/api/, '') // 重写路径
            },
            '/dev/file': {
                target: 'http://localhost:3000', // 后端服务地址s
                changeOrigin: true, // 允许跨域
                rewrite: (path) => path.replace(/^\/file/, 'file') // 重写路径
            }
       } 
    }
})
