import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // Обязательный флаг для работы с куками
});

export default api;
