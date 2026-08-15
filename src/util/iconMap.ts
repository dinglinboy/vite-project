import {
    Menu as IconMenu,
    Goods,
    Document,
    Setting,
    Location,
    BellFilled,
    ShoppingCartFull,
    User,
    Histogram,
    FolderOpened,
    Grid,
    List,
    Star,
    Tools,
    Connection,
    Coin,
    Notebook
} from '@element-plus/icons-vue'
import type { Component } from 'vue'

/**
 * 菜单 icon 字符串 → 图标组件映射
 * 与后端 sys_menu.icon 字段对应，新增菜单时可直接填这些名字
 */
export const iconMap: Record<string, Component> = {
    Menu: IconMenu,
    Goods,
    Order: ShoppingCartFull,
    Document,
    Location,
    Setting,
    BellFilled,
    User,
    Histogram,
    FolderOpened,
    Grid,
    List,
    Star,
    Tools,
    Connection,
    Coin,
    Notebook
}
