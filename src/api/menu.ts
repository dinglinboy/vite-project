import axios from '@/util/axios'
import { Result, PagingDto } from '@/interfaces/base.interface'

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 'M', // 目录
  MENU = 'C',      // 菜单
  BUTTON = 'F'     // 按钮
}

// 菜单状态枚举
export enum MenuStatus {
  NORMAL = '0',    // 正常
  DISABLED = '1'   // 停用
}

// 菜单显示状态枚举
export enum MenuVisible {
  SHOW = '0',      // 显示
  HIDE = '1'       // 隐藏
}

// 菜单实体接口
export interface MenuEntity {
  menuId?: number
  menuName: string
  parentId?: number | null
  sortIndex?: number
  path?: string
  component?: string
  query?: string
  isFrame?: string
  isCache?: string
  menuType: MenuType
  visible?: MenuVisible
  status?: MenuStatus
  perms?: string
  icon?: string
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
  children?: MenuEntity[]
}

// 查询菜单列表参数
export interface ListMenuDto extends PagingDto {
  menuName?: string
  status?: MenuStatus
  menuType?: MenuType
  parentId?: number | null
}

// 创建菜单参数
export interface CreateMenuDto {
  menuName: string
  parentId?: number | null
  sortIndex?: number | string
  path?: string
  component?: string
  query?: string
  isFrame?: string
  isCache?: string
  menuType: MenuType
  visible?: MenuVisible
  status?: MenuStatus
  perms?: string
  icon?: string
  remark?: string
}

// 更新菜单参数
export interface UpdateMenuDto extends Partial<CreateMenuDto> {
  menuId: number
}

// API响应类型
export interface MenuListResult extends Result {
  result: {
    data: MenuEntity[]
    total: number
    pageSize?: number
    pageNum?: number
  }
}

export interface MenuTreeResult extends Result {
  result: MenuEntity[]
}

export interface MenuDetailResult extends Result {
  result: MenuEntity
}

export interface RoleMenuTreeResult extends Result {
  result: {
    menus: MenuEntity[]
    checkedKeys: number[]
  }
}

/**
 * 获取菜单列表
 * @param params 查询参数
 * @returns 菜单列表
 */
export const getMenuList = (params: ListMenuDto) => {
  return axios.get<any, MenuListResult>('/menu/list', { params })
}

/**
 * 获取菜单树形结构
 * @returns 菜单树
 */
export const getMenuTree = () => {
  return axios.get<any, MenuTreeResult>('/menu/tree')
}

/**
 * 根据ID获取菜单详情
 * @param menuId 菜单ID
 * @returns 菜单详情
 */
export const getMenuDetail = (menuId: number) => {
  return axios.get<any, MenuDetailResult>(`/menu/${menuId}`)
}

/**
 * 创建菜单
 * @param data 菜单数据
 * @returns 创建结果
 */
export const createMenu = (data: CreateMenuDto) => {
  return axios.post<any, Result>('/menu/create', data)
}

/**
 * 更新菜单
 * @param data 菜单数据
 * @returns 更新结果
 */
export const updateMenu = (data: UpdateMenuDto) => {
  return axios.put<any, Result>(`/menu/${data.menuId}`, data)
}

/**
 * 删除菜单
 * @param menuId 菜单ID
 * @returns 删除结果
 */
export const deleteMenu = (menuId: number) => {
  return axios.delete<any, Result>(`/menu/${menuId}`)
}

/**
 * 获取角色菜单树选择
 * @param roleId 角色ID
 * @returns 角色菜单树
 */
export const getRoleMenuTreeSelect = (roleId: number) => {
  return axios.get<any, RoleMenuTreeResult>(`/menu/roleMenuTreeSelect/${roleId}`)
}