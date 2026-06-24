import axios from 'axios'

export const collegeApi = {
  getAll() {
    return axios.get('http://localhost:5000/api/College')
  }
}