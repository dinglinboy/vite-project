<template>
    <div class="profile-container">
        <div class="profile-header">
            <div class="header-bg"></div>
            <div class="header-content">
                <h1 class="page-title">
                    <el-icon class="title-icon"><User /></el-icon>
                    个人中心
                </h1>
                <p class="page-subtitle">管理您的个人信息和偏好设置</p>
            </div>
        </div>
        <div class="profile-content">
            <el-row :gutter="24">
                <!-- 头像卡片 -->
                <el-col :xs="24" :sm="24" :md="8" :lg="6">
                    <el-card class="avatar-card" shadow="hover">
                        <div class="avatar-section">
                            <div class="avatar-wrapper">
                                <el-upload
                                    class="avatar-uploader"
                                    :action="uploadUrl"
                                    :headers="getHeaders()"
                                    :show-file-list="false"
                                    :on-success="handleAvatarSuccess"
                                    :before-upload="beforeAvatarUpload"
                                >
                                    <div class="avatar-container">
                                        <img
                                            v-if="userInfo.avatar"
                                            :src="getAvator(userInfo.avatar)"
                                            class="avatar"
                                        />
                                        <div v-else class="avatar-placeholder">
                                            <el-icon class="avatar-icon"
                                                ><Plus
                                            /></el-icon>
                                        </div>
                                        <div class="avatar-overlay">
                                            <el-icon class="upload-icon"
                                                ><Camera
                                            /></el-icon>
                                            <span class="upload-text"
                                                >更换头像</span
                                            >
                                        </div>
                                    </div>
                                </el-upload>
                            </div>
                            <div class="user-basic-info">
                                <h3 class="username">
                                    {{ userInfo.nickname || userInfo.username }}
                                </h3>
                                <p class="user-role">{{ userInfo.username }}</p>
                            </div>
                        </div>
                    </el-card>
                </el-col>

                <!-- 信息表单卡片 -->
                <el-col :xs="24" :sm="24" :md="16" :lg="18">
                    <el-card class="form-card" shadow="hover">
                        <template #header>
                            <div class="card-header">
                                <span class="card-title">
                                    <el-icon class="header-icon"
                                        ><Edit
                                    /></el-icon>
                                    基本信息
                                </span>
                            </div>
                        </template>

                        <el-form
                            :model="userInfo"
                            :rules="rules"
                            ref="formRef"
                            label-width="80px"
                            class="profile-form"
                        >
                            <el-row :gutter="24">
                                <el-col :xs="24" :sm="12">
                                    <el-form-item label="用户名">
                                        <el-input
                                            v-model="userInfo.username"
                                            disabled
                                            prefix-icon="User"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="12">
                                    <el-form-item label="昵称" prop="nickname">
                                        <el-input
                                            v-model="userInfo.nickname"
                                            placeholder="请输入昵称"
                                            prefix-icon="Star"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="24">
                                <el-col :xs="24" :sm="12">
                                    <el-form-item label="邮箱" prop="email">
                                        <el-input
                                            v-model="userInfo.email"
                                            placeholder="请输入邮箱地址"
                                            prefix-icon="Message"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :xs="24" :sm="12">
                                    <el-form-item
                                        label="手机号"
                                        prop="phoneNum"
                                    >
                                        <el-input
                                            v-model="userInfo.phoneNum"
                                            placeholder="请输入手机号"
                                            prefix-icon="Phone"
                                        ></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-form-item label="性别">
                                <el-radio-group
                                    v-model="userInfo.sex"
                                    class="gender-group"
                                >
                                    <el-radio label="1" class="gender-radio">
                                        <el-icon class="gender-icon male"
                                            ><Male
                                        /></el-icon>
                                        男
                                    </el-radio>
                                    <el-radio label="2" class="gender-radio">
                                        <el-icon class="gender-icon female"
                                            ><Female
                                        /></el-icon>
                                        女
                                    </el-radio>
                                </el-radio-group>
                            </el-form-item>

                            <el-form-item label="个人描述">
                                <el-input
                                    v-model="userInfo.remark"
                                    type="textarea"
                                    :rows="4"
                                    placeholder="请输入个人描述"
                                    show-word-limit
                                    maxlength="200"
                                ></el-input>
                            </el-form-item>

                            <el-form-item class="submit-section">
                                <el-button
                                    type="primary"
                                    @click="submitForm"
                                    size="large"
                                    class="submit-btn"
                                >
                                    <el-icon class="btn-icon"
                                        ><Check
                                    /></el-icon>
                                    保存修改
                                </el-button>
                                <el-button
                                    @click="resetForm"
                                    size="large"
                                    class="reset-btn"
                                >
                                    <el-icon class="btn-icon"
                                        ><Refresh
                                    /></el-icon>
                                    重置
                                </el-button>
                            </el-form-item>
                        </el-form>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import {
    Plus,
    User,
    Edit,
    Star,
    Message,
    Phone,
    Male,
    Female,
    Camera,
    Check,
    Refresh
} from '@element-plus/icons-vue'
import { getUserInfoByUsername, updateUserApi } from '@/api/user'
import { getJwtToken, getUserInfo } from '@/util/util'
import type { UploadProps, FormInstance, FormRules } from 'element-plus'
import { UserDto } from '@/api/types/response'
const uploadUrl =
    import.meta.env.VITE_API_BASE_URL + '/common/upload/singleFile'
const getHeaders = () => ({
    Authorization: 'Bearer ' + getJwtToken()
})

const formRef = ref<FormInstance>()

// 表单验证规则
const rules = reactive<FormRules>({
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        {
            min: 2,
            max: 20,
            message: '昵称长度应在2-20个字符之间',
            trigger: ['blur', 'change']
        }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
        }
    ],
    phoneNum: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        {
            pattern: /^1[3-9]\d{9}$/,
            message: '请输入正确的手机号格式',
            trigger: ['blur', 'change']
        }
    ]
})
const userInfo = reactive<UserDto>({
    id: null,
    username: '',
    nickname: '',
    email: '',
    phoneNum: '',
    sex: '',
    remark: '',
    avatar: ''
})

const handleAvatarSuccess: UploadProps['onSuccess'] = (
    response,
    uploadFile
) => {
    // 假设上传成功后，服务器返回的数据中包含了图片URL
    console.log(response)
    userInfo.avatar = response.result.url
    ElMessage.success('头像上传成功')
}
interface File {
    type: string
    size: number
    // 可能还有其他属性，根据实际情况添加
}
const beforeAvatarUpload = (file: File) => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG) {
        ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
    }
    if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!')
    }
    return isJPG && isLt2M
}

const resetForm = () => {
    if (!formRef.value) return
    formRef.value.resetFields()
    getInfo() // 重新获取原始数据
    ElMessage.success('表单已重置')
}
const getInfo = async () => {
    const { username } = getUserInfo()
    const res = await getUserInfoByUsername({ username })
    userInfo.id = res?.result?.id
    userInfo.username = res?.result?.username
    userInfo.email = res?.result?.email
    userInfo.nickname = res?.result?.nickname
    userInfo.phoneNum = res?.result?.phoneNum
    userInfo.sex = res?.result?.sex
    userInfo.remark = res?.result?.remark
    userInfo.avatar = res?.result?.avatar
}

const getAvator = (avatar: string | undefined) => {
    return avatar ? import.meta.env.VITE_FILE_URL + avatar : avatar
}
const submitForm = () => {
    updateUserApi(userInfo)
        .then(() => {
            ElMessage.success('个人信息更新成功')
            if (formRef.value) {
                formRef.value.resetFields()
            }
            getInfo() // 更新后重新获取最新数据
        })
        .catch((error) => {
            ElMessage.error('更新失败: ' + error.message)
        })
}
onMounted(() => {
    getInfo()
})
</script>

<style scoped>
.profile-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 0;
}

.profile-header {
    position: relative;
    height: 200px;
    overflow: hidden;
    margin-bottom: -80px;
}

.header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0.9;
}

.header-bg::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>')
        repeat;
    opacity: 0.3;
}

.header-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: white;
    text-align: center;
}

.page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.title-icon {
    font-size: 2.2rem;
}

.page-subtitle {
    font-size: 1.1rem;
    margin: 8px 0 0 0;
    opacity: 0.9;
    font-weight: 300;
}

.profile-content {
    position: relative;
    z-index: 3;
    padding: 80px 24px 40px;
    max-width: 1200px;
    margin: 0 auto;
}

.avatar-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
}

.avatar-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.avatar-section {
    text-align: center;
    padding: 20px;
}

.avatar-wrapper {
    margin-bottom: 20px;
}

.avatar-container {
    position: relative;
    display: inline-block;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
}

.avatar-container:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.avatar {
    width: 120px;
    height: 120px;
    object-fit: cover;
    display: block;
    border-radius: 50%;
}

.avatar-placeholder {
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px dashed #d1d5db;
}

.avatar-icon {
    font-size: 2.5rem;
    color: #9ca3af;
}

.avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
    cursor: pointer;
}

.avatar-container:hover .avatar-overlay {
    opacity: 1;
}

.upload-icon {
    font-size: 1.5rem;
    color: white;
    margin-bottom: 4px;
}

.upload-text {
    color: white;
    font-size: 0.8rem;
    font-weight: 500;
}

.user-basic-info {
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
}

.username {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 8px 0;
}

.user-role {
    color: #6b7280;
    font-size: 0.9rem;
    margin: 0;
    font-weight: 400;
}

.form-card {
    border-radius: 16px;
    border: none;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
}

.form-card:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.card-header {
    display: flex;
    align-items: center;
    padding: 0;
}

.card-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 8px;
}

.header-icon {
    font-size: 1.1rem;
    color: #667eea;
}

.profile-form {
    padding: 20px 0;
}

.profile-form :deep(.el-form-item__label) {
    font-weight: 500;
    color: #374151;
}

.profile-form :deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.profile-form :deep(.el-input__wrapper:hover) {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.profile-form :deep(.el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.profile-form :deep(.el-textarea__inner) {
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.profile-form :deep(.el-textarea__inner:hover) {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.profile-form :deep(.el-textarea.is-focus .el-textarea__inner) {
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.gender-group {
    display: flex;
    gap: 24px;
}

.gender-radio {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    background: #f9fafb;
}

.gender-radio:hover {
    border-color: #667eea;
    background: #f0f4ff;
}

.gender-radio.is-checked {
    border-color: #667eea;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.gender-icon {
    font-size: 1.1rem;
}

.gender-icon.male {
    color: #3b82f6;
}

.gender-icon.female {
    color: #ec4899;
}

.gender-radio.is-checked .gender-icon {
    color: white;
}

.submit-section {
    margin-top: 32px;
    text-align: center;
    border-top: 1px solid #f3f4f6;
    padding-top: 24px;
}

.submit-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    padding: 12px 32px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
    margin-right: 16px;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.reset-btn {
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px 32px;
    font-weight: 600;
    background: white;
    color: #6b7280;
    transition: all 0.3s ease;
}

.reset-btn:hover {
    border-color: #9ca3af;
    background: #f9fafb;
    transform: translateY(-1px);
}

.btn-icon {
    margin-right: 6px;
}

.avatar-uploader {
    :deep(.el-upload) {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration-fast);

        &:hover {
            border-color: var(--el-color-primary);
        }
    }
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .profile-header {
        height: 160px;
        margin-bottom: -60px;
    }

    .page-title {
        font-size: 2rem;
    }

    .profile-content {
        padding: 60px 16px 24px;
    }

    .avatar {
        width: 100px;
        height: 100px;
    }

    .avatar-placeholder {
        width: 100px;
        height: 100px;
    }

    .gender-group {
        flex-direction: column;
        gap: 12px;
    }

    .submit-section {
        text-align: center;
    }

    .submit-btn,
    .reset-btn {
        width: 100%;
        margin: 8px 0;
    }
}

/* 动画效果 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.avatar-card,
.form-card {
    animation: fadeInUp 0.6s ease-out;
}

.form-card {
    animation-delay: 0.2s;
}
</style>
