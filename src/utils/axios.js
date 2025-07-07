import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_BACK_END_BASEURL || 'https://dev.backend.test.daas.datacentrix.cloud';
const cloudBaseURL = process.env.NEXT_PUBLIC_CLOUD_BACKEND_BASEURL || 'http://localhost:8003';
console.log('Axios baseURL:', baseURL);
console.log('Cloud baseURL:', cloudBaseURL);

const axiosServices = axios.create({
  baseURL: baseURL
});

// Create separate axios instance for cloud endpoints
const axiosCloudServices = axios.create({
  baseURL: cloudBaseURL
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

// interceptor for cloud endpoints
axiosCloudServices.interceptors.request.use(
    (config) => {
        console.log('Making CLOUD request to:', config.url, 'with baseURL:', config.baseURL);
        return config;
    },
    (error) => {
        console.error('Cloud request error:', error);
        return Promise.reject(error);
    }
);

axiosCloudServices.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Cloud API Error:', error.response?.data || error.message);
        console.error('Full cloud error:', error);
        return Promise.reject(error);
    }
);

export default axiosServices;
export { axiosCloudServices };
