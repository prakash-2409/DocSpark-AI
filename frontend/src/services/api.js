import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const uploadAndProcessFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/api/upload', formData);
  return response.data;
};

export default api;
