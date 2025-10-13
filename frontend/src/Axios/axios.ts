import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is crucial for cookies
});


export default axiosInstance;