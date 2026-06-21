import axios from 'axios'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',  // 后端 API 地址
  timeout: 10000
})

// 学生相关 API
export const studentApi = {
  // 获取所有学生
  getAll() {
    return apiClient.get('/Student')
  },

  // 根据 ID 获取学生
  getById(id) {
    return apiClient.get(`/Student/${id}`)
  },

  // 新增学生
  create(data) {
    return apiClient.post('/Student', data)
  },

  // 更新学生
  update(id, data) {
    return apiClient.put(`/Student/${id}`, data)
  },

  // 删除学生
  delete(id) {
    return apiClient.delete(`/Student/${id}`)
  }
}