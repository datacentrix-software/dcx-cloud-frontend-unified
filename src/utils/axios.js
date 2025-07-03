 import axios from 'axios';

 const axiosServices = axios.create();
 
 // interceptor for http
 axiosServices.interceptors.response.use(
     (response) => response,
     (error) => {
         // Only log in development
         if (process.env.NODE_ENV === 'development') {
             console.error('API Error:', error.response?.data || error.message);
         }
         // Preserve the full error object for proper handling
         return Promise.reject(error);
     }
 );
 
 export default axiosServices;
 