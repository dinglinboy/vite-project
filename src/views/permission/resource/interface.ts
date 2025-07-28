export interface MenuData {
  id?: any
  menuName: string
  sortIndex: number
  parentId: number
  path: string
  query: string
  component: string
  icon: string
  menuType: string
  isCache: string
  isFrame: string
  status: string
  visible: string
  perms: string
  createTime: string
}
export interface ParentOption {
  label: string
  value: number
}