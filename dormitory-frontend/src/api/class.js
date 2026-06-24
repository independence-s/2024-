import axios from 'axios'

export const classApi = {
  getAll() {
    return axios.get('http://localhost:5000/api/Class')
  },
  getByCollege(collegeId) {
    return axios.get(`http://localhost:5000/api/Class/byCollege/${collegeId}`)
  }
}