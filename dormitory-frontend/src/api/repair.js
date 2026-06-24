import axios from 'axios'

export const repairApi = {
  // 获取所有报修记录
  getAll() {
    return axios.get('http://localhost:5000/api/RepairRecords')
  },
  // 根据ID获取报修详情
  getById(id) {
    return axios.get(`http://localhost:5000/api/RepairRecords/${id}`)
  },
  // 获取某个学生的报修记录
  getByStudent(studentId) {
    return axios.get(`http://localhost:5000/api/RepairRecords/student/${studentId}`)
  },
  // 提交报修（学生）
  create(data) {
    return axios.post('http://localhost:5000/api/RepairRecords', data)
  },
  // 更新报修状态（管理员）
  update(id, data) {
    return axios.put(`http://localhost:5000/api/RepairRecords/${id}`, data)
  },
  // 删除报修（管理员）
  delete(id) {
    return axios.delete(`http://localhost:5000/api/RepairRecords/${id}`)
  }
}