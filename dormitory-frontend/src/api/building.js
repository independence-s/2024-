import axios from 'axios'

export const buildingApi = {
  getAll() {
    return axios.get('http://localhost:5000/api/Buildings')
  },
  getById(id) {
    return axios.get(`http://localhost:5000/api/Buildings/${id}`)
  },
  create(data) {
    return axios.post('http://localhost:5000/api/Buildings', data)
  },
  update(id, data) {
    return axios.put(`http://localhost:5000/api/Buildings/${id}`, data)
  },
  delete(id) {
    return axios.delete(`http://localhost:5000/api/Buildings/${id}`)
  }
}