interface UserInfo {
    username?: string
    checked?: boolean
    jwt_token?: string
}
let userInfo: UserInfo | null = null
export const setUserInfo = (info: UserInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(info))
    userInfo = info
}
export const clearUserInfo = () => {
    userInfo = null
    localStorage.removeItem('userInfo')
}
export const getUserInfo = () => {
    if (userInfo) return userInfo
    const res: string | null = localStorage.getItem('userInfo') || '{}'
    try {
        userInfo = JSON.parse(res)
    } catch (error) {
        userInfo = {}
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