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
        <el-menu-item index="/students">
          <el-icon><User /></el-icon>
          <span>学生管理</span>
        </el-menu-item>
        <el-menu-item index="/rooms">
          <el-icon><HomeFilled /></el-icon>
          <span>房间管理</span>
        </el-menu-item>
        <el-menu-item index="/buildings">
          <el-icon><OfficeBuilding /></el-icon>
          <span>宿舍楼管理</span>
        </el-menu-item>
        <el-menu-item index="/repairs">
          <el-icon><Tools /></el-icon>
          <span>报修管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header style="background-color: #fff; border-bottom: 1px solid #e6e6e6; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;">
        <span style="font-size: 18px; font-weight: bold;">宿舍管理系统</span>
        <div>
          <el-button link>管理员</el-button>
          <el-button link style="color: #f56c6c;">退出登录</el-button>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main style="background-color: #f0f2f5; padding: 20px;">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { DataBoard, User, HomeFilled, Tools, OfficeBuilding } from '@element-plus/icons-vue'
</script>

<style>
.el-menu {
  border-right: none;
}
body {
  margin: 0;
}
</style>