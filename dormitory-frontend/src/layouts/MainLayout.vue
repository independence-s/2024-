<template>
  <el-container style="height: 100vh;">
    <!-- 左侧菜单 -->
    <el-aside width="200px" style="background-color: #304156; color: white;">
      <div style="height: 60px; line-height: 60px; text-align: center; font-size: 18px; font-weight: bold; background-color: #1f2d3d;">
        🏠 宿舍管理
      </div>
      <el-menu
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        :default-active="$route.path"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon>
          <span>控制台</span>
        </el-menu-item>
        <el-menu-item index="/residences">
          <el-icon><HomeFilled /></el-icon>
          <span>住宿管理</span>
        </el-menu-item>

        <el-menu-item v-if="userInfo?.role === 2" index="/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>

        <el-menu-item v-if="userInfo?.role === 2" index="/buildings">
          <el-icon><OfficeBuilding /></el-icon>
          <span>宿舍楼管理</span>
        </el-menu-item>

        <el-menu-item v-if="userInfo?.role === 1 || userInfo?.role === 2" index="/rooms">
          <el-icon><HomeFilled /></el-icon>
          <span>房间管理</span>
        </el-menu-item>

        <el-menu-item v-if="userInfo?.role === 1 || userInfo?.role === 2" index="/repairs">
          <el-icon><Tools /></el-icon>
          <span>报修管理</span>
        </el-menu-item>

        <el-menu-item v-if="userInfo?.role === 2" index="/users">
          <el-icon><Setting /></el-icon>
          <span>用户管理</span>
        </el-menu-item>

        <el-menu-item index="/my-repairs">
          <el-icon><Document /></el-icon>
          <span>我的报修</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <el-header style="background-color: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
        <span style="font-size: 18px; font-weight: bold;">宿舍管理系统</span>
        <div>
          <span style="margin-right: 15px; color: #409EFF;">{{ userInfo?.username || '管理员' }}</span>
          <el-button link style="color: #f56c6c;" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main style="background-color: #f0f2f5; padding: 20px;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DataBoard, User, HomeFilled, Tools, OfficeBuilding, Setting, Document } from '@element-plus/icons-vue'

const router = useRouter()
const userInfo = ref({})

onMounted(() => {
  const stored = localStorage.getItem('user')
  if (stored) {
    userInfo.value = JSON.parse(stored)
  }
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style>
.el-menu {
  border-right: none;
}
body {
  margin: 0;
}
</style>