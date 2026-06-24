import axios from 'axios'

export const residenceApi = {
  getAll() {
    return axios.get('http://localhost:5000/api/Residence')
  },
  getByStudent(studentId) {
    return axios.get(`http://localhost:5000/api/Residence/student/${studentId}`)
  },
  assign(data) {
    return axios.post('http://localhost:5000/api/Residence/assign', data)
  },
  batchAssign(data) {
    return axios.post('http://localhost:5000/api/Residence/batchAssign', data)
  },
  change(data) {
    return axios.post('http://localhost:5000/api/Residence/change', data)
  },
  checkout(data) {
    return axios.post('http://localhost:5000/api/Residence/checkout', data)
  }
}