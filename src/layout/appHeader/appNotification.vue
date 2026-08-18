<template>
    <div class="app-notification" @click="goOrders">
        <el-badge :value="unreadCount" :hidden="!unreadCount" :max="99">
            <svg class="bell-icon" :class="{ ring: unreadCount }" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
        </el-badge>
        <el-tooltip content="新订单实时提醒" placement="bottom">
            <span class="notify-label">新订单</span>
        </el-tooltip>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElNotification } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const unreadCount = ref(0)
let source: EventSource | null = null

interface NewOrderPayload {
    orderNo: string
    username: string
    payAmount: number | string
    totalAmount: number | string
    source: string
    createTime: string
}

onMounted(() => {
    connect()
})

onBeforeUnmount(() => {
    source?.close()
})

function connect() {
    const token = localStorage.getItem('jwt_token')
    if (!token) return
    const base = import.meta.env.VITE_API_BASE_URL || '/dev/api'
    source = new EventSource(`${base}/sse/orders?token=${encodeURIComponent(token)}`)
    source.addEventListener('newOrder', (event) => {
        try {
            const payload: NewOrderPayload = JSON.parse((event as MessageEvent).data)
            unreadCount.value += 1
            ElNotification({
                title: '新订单通知',
                message: `用户「${payload.username}」下单 ¥${Number(payload.payAmount).toFixed(2)}（${payload.source === 'buy_now' ? '立即购买' : '购物车'}）\n订单号：${payload.orderNo}`,
                type: 'success',
                duration: 8000,
                onClick: () => {
                    unreadCount.value = 0
                    router.push('/order/list')
                }
            })
        } catch {
            // 忽略解析失败
        }
    })
    source.onerror = () => {
        source?.close()
        source = null
        setTimeout(connect, 5000)
    }
}

function goOrders() {
    unreadCount.value = 0
    router.push('/order/list')
}
</script>

<style lang="scss" scoped>
.app-notification {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    height: 100%;
    cursor: pointer;
    color: var(--el-text-color-secondary);
    transition: color 0.2s;

    &:hover {
        color: var(--mall-primary);
    }

    .bell-icon {
        display: block;

        &.ring {
            animation: bell-shake 0.6s ease-in-out;
        }
    }

    .notify-label {
        font-size: 12px;
        color: inherit;
    }
}

@keyframes bell-shake {
    0%,
    100% {
        transform: rotate(0);
    }
    20% {
        transform: rotate(-12deg);
    }
    40% {
        transform: rotate(10deg);
    }
    60% {
        transform: rotate(-6deg);
    }
    80% {
        transform: rotate(4deg);
    }
}
</style>