import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sixty-taxis-bathe.loca.lt',
  withCredentials: true, 
});

export default api;
