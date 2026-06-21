import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
})

export const roomApi = {
  getAll() { return apiClient.get('/Rooms') },
  getById(id) { return apiClient.get(`/Rooms/${id}`) },
  create(data) { return apiClient.post('/Rooms', data) },
  update(id, data) { return apiClient.put(`/Rooms/${id}`, data) },
  delete(id) { return apiClient.delete(`/Rooms/${id}`) }
}