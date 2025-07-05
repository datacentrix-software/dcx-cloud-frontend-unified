import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACK_END_BASEURL || 'https://dev.backend.test.daas.datacentrix.cloud';
console.log('Axios baseURL:', baseURL);

const axiosServices = axios.create({
  baseURL: baseURL
});

// interceptor for http
axiosServices.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url, 'with baseURL:', config.baseURL);
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

axiosServices.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        console.error('Full error:', error);
        return Promise.reject(error);
    }
);

export default axiosServices;
