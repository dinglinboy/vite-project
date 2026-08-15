import type { Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/user'

/**
 * 判断当前用户是否拥有指定权限（任一命中即可）
 * 超管权限标识 *:*:* 恒通过
 */
export const checkPermission = (perms: string | string[]): boolean => {
    const permList = Array.isArray(perms) ? perms : [perms]
    if (!permList.length) return true
    const { permissions } = useUserStore()
    if (permissions.includes('*:*:*')) return true
    return permList.some((perm) => permissions.includes(perm))
}

/**
 * 按钮级权限指令：v-permission="['permission:user:add']"
 * 无权限时直接移除元素
 */
const permissionDirective: Directive = {
    mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
        if (!checkPermission(binding.value)) {
            el.parentNode?.removeChild(el)
        }
    }
}

export default permissionDirective
