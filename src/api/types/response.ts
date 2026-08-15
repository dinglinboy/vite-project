import { Result } from '@/interfaces/base.interface'

export interface Role {
    roleId?: number
    roleName: string
    remakr?: string
    roleKey: string
    roleSort?: number
    status?: string
    remark?: string
    /** 关联的菜单ID列表（新增/编辑角色时提交） */
    menuIds?: number[]
    createTime?: string
    updateTime?: string
}
interface RoleListResult {
    data: Role[]
    total: number
}
export interface getRoleListResponse extends Result {
    redult: RoleListResult
}
export interface UserDto {
    id?: number | null
    username?: string
    nickname?: string
    email?: string
    phoneNum?: string
    sex?: string
    remark?: string
    avatar?: string
}
interface UserListResult {
    data: UserDto[]
    total: number
}
export interface getUsersResponse extends Result {
    result: UserListResult
}
export interface getUsersResponseDto extends Result {
    result: UserDto
}

export interface Dept {
    deptId?: string
    deptName: string
    createTime?: string
    updateTime?: string
}
interface DeptListResult {
    data: Dept[]
    total: number
}
export interface getDeptListResponse extends Result {
    result: DeptListResult
}

// ===== 商品 =====
export interface SkuItem {
    id?: number
    name: string
    price: number
    stock: number
    image?: string
    specValues?: {
        key: string
        value: string
    }[]
}

export interface ProductItem {
    id: number
    name: string
    goods_no?: string
    subtitle?: string
    description?: string
    images?: string[]
    skus?: SkuItem[]
    tags?: string[]
    price?: number
    stock?: number
    sales_count?: number
    rating?: number
    review_count?: number
    product_status?: 'draft' | 'published' | 'archived'
    specs?: { key: string; value: string }[]
    categoryId?: number
    category?: { id: number; name: string }
    category_id?: number
    brandId?: number
    brand?: { id: number; name: string }
    brand_id?: number
    createTime?: string
    updateTime?: string
}

export interface ProductQuery {
    name?: string
    categoryId?: number
    product_status?: string
    pageNum: number
    pageSize: number
}

// ===== 商品评论 =====
export interface ReviewItem {
    id: number
    product_id: number
    product_name: string
    user_id: number
    username: string
    rating: number
    content: string
    images?: string[] | null
    reply_content?: string | null
    reply_time?: string | null
    reply_by?: string | null
    createTime?: string
}

export interface ReviewQuery {
    productName?: string
    rating?: number
    replied?: string
    pageNum: number
    pageSize: number
}

// ===== 品牌 =====
export interface BrandItem {
    id: number
    name: string
    logo?: string
    description?: string
    sort_order?: number
    createTime?: string
}

export interface BrandQuery {
    name?: string
    pageNum: number
    pageSize: number
}

// ===== 数据字典 =====
export interface DictTypeItem {
    dict_id: number
    dict_name: string
    dict_type: string
    status?: string
    createTime?: string
}

export interface DictDataItem {
    dict_code: number
    dict_sort?: number
    dict_label: string
    dict_value: string
    dict_type: string
    list_class?: string
    is_default?: string
    status?: string
    createTime?: string
}

// ===== 订单 =====
export interface OrderItem {
    id?: number
    orderId?: number
    orderNo?: string
    productId: number
    productName: string
    productImage?: string
    skuName?: string
    price: number
    quantity: number
    total: number
}

export interface OrderItemRow {
    id: number
    orderNo: string
    username: string
    totalAmount: number
    payAmount: number
    orderStatus: string
    receiverName: string
    receiverPhone: string
    receiverAddress: string
    shipNo?: string
    remark?: string
    payTime?: string
    shipTime?: string
    completeTime?: string
    cancelTime?: string
    createTime?: string
    items?: OrderItem[]
}
