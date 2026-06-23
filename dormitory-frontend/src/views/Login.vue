<template>
  <div style="height: 100vh; display: flex; align-items: center; justify-content: center; background: #f0f2f5;">
    <el-card style="width: 400px; padding: 30px;">
      <h2 style="text-align: center; margin-bottom: 30px;">🏠 宿舍管理系统</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" size="large" prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" size="large" prefix-icon="Lock" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" style="width: 100%;" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: form.username,
      password: form.password
    })

    // 保存 Token 和用户信息
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    ElMessage.success('登录成功！')
    router.push('/dashboard')
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data?.message || '登录失败')
    } else {
      ElMessage.error('网络错误，请检查后端是否运行')
    }
  } finally {
    loading.value = false
  }
}
</script>