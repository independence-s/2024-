import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000
})

export const buildingApi = {
  getAll() { return apiClient.get('/Buildings') },
  getById(id) { return apiClient.get(`/Buildings/${id}`) },
  create(data) { return apiClient.post('/Buildings', data) },
  update(id, data) { return apiClient.put(`/Buildings/${id}`, data) },
  delete(id) { return apiClient.delete(`/Buildings/${id}`) }
}