import axios from 'axios'

export const studentApi = {
  getAll() {
    return axios.get('http://localhost:5000/api/Student')
  },
  getById(id) {
    return axios.get(`http://localhost:5000/api/Student/${id}`)
  },
  create(data) {
    return axios.post('http://localhost:5000/api/Student', data)
  },
  update(id, data) {
    return axios.put(`http://localhost:5000/api/Student/${id}`, data)
  },
  delete(id) {
    return axios.delete(`http://localhost:5000/api/Student/${id}`)
  }
}