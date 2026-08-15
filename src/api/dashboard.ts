import axios from '@/util/axios'
import { Result } from '@/interfaces/base.interface'

/**
 * 仪表盘统计数据
 * @return 卡片/趋势/状态分布/分类分布/热销Top5/最新订单
 */
export const getDashboardStatsApi = () => {
    return axios.get<any, Result>('/dashboard/stats')
}