import { UserDto } from '@/api/types/response'
let userInfo: UserDto = {}
export const setUserInfo = (info: UserDto) => {
    localStorage.setItem('userInfo', JSON.stringify(info))
    userInfo = info
}
export const clearUserInfo = () => {
    userInfo = {} as UserDto
    localStorage.removeItem('userInfo')
}
export const getUserInfo = () => {
    if (userInfo.username) return userInfo
    const res: string | null = localStorage.getItem('userInfo') || '{}'
    try {
        userInfo = JSON.parse(res)
    } catch (error) {
        userInfo = {} as UserDto
    }
    return userInfo
}

interface LoginInfo {
    username: string
    password: string
    checked: boolean
}
export const setLoginInfo = (loginInfo: LoginInfo) => {
    localStorage.setItem('loginInfo', JSON.stringify(loginInfo))
}
export const getLoginInfo = () => {
    const loginInfo: string | null = localStorage.getItem('loginInfo') || '{}'
    try {
        return JSON.parse(loginInfo) as LoginInfo
    } catch (error) {
        return {} as LoginInfo
    }
}

export const setJwtToken = (token: string) => {
    localStorage.setItem('jwt_token', token)
}

export const getJwtToken = (): string | null => {
    return localStorage.getItem('jwt_token')
}

export const clearJwtToken = () => {
    localStorage.removeItem('jwt_token')
}
