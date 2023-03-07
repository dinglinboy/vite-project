interface UserInfo {
    username?: string
    checked?: boolean
    jwt_token?: string
}
let userInfo: UserInfo = null
export const setUserInfo = (info: UserInfo) => {
    localStorage.setItem('userIfno', JSON.stringify(info))
    userInfo = info
}
export const clearUserInfo = () => {
    userInfo = null
    localStorage.removeItem('userIfno')
}
export const getUserInfo = () => {
    if (userInfo) return userInfo
    const res: string = localStorage.getItem('userIfno') || '{}'
    try {
        userInfo = JSON.parse(res)
    } catch (error) {
        userInfo = {}
    }
    return userInfo
}
