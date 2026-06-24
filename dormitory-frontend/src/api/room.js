import axios from 'axios'

export const roomApi = {
  getAll() {
    return axios.get('http://localhost:5000/api/Rooms')
  },
  getById(id) {
    return axios.get(`http://localhost:5000/api/Rooms/${id}`)
  },
  create(data) {
    return axios.post('http://localhost:5000/api/Rooms', data)
  },
  update(id, data) {
    return axios.put(`http://localhost:5000/api/Rooms/${id}`, data)
  },
  delete(id) {
    return axios.delete(`http://localhost:5000/api/Rooms/${id}`)
  },
  // 获取某房间的入住学生列表
  getStudentsByRoom(roomId) {
    return axios.get(`http://localhost:5000/api/Rooms/${roomId}/students`)
  }
}