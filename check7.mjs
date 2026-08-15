import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu']
})
const page = await browser.newPage()
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 30000 })
await page.type('input[placeholder="请输入用户名"]', 'admin')
await page.type('input[placeholder="请输入密码"]', 'admin123')
await page.click('button.submit')
await new Promise((r) => setTimeout(r, 4000))
const state = await page.evaluate(async () => {
    const mod = await import('/src/store/user.ts')
    const store = mod.useUserStore()
    const router = (await import('/src/router/index.ts')).default
    return {
        isLoaded: store.isLoaded,
        routerCount: store.routers.length,
        routesInRouter: router.getRoutes().length,
        hasMenu1: router.hasRoute('menu_1'),
        addedRouteNames: store.addedRouteNames
    }
})
console.log(JSON.stringify(state, null, 2))
await browser.close()
