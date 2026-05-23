import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fancy-bears-bake.loca.lt',
  withCredentials: true, 
});

export default api;
