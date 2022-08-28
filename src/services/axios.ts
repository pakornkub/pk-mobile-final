import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { REACT_APP_API_URL } from '@env';

// Add a request interceptor
axios.interceptors.request.use(async (config) => {

    // Do something before request is sent

    const token = await AsyncStorage.getItem("accessToken");

    //config.url = `${'http://172.30.22.161/pk-rest-server'}${config.url}`;
    config.timeout = 1000 * 10
    config.url = `${REACT_APP_API_URL}${config.url}`;
    //config.headers = { 'Content-Type': 'multipart/form-data' }
    
    if (token) {
        config.headers = { /* ...config.headers, */ 'Authorization': JSON.parse(token || "{}") }
    }

    return config;

}, (error) => {

    // Do something with request error

    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use((response) => {

    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    return response;

}, function (error) {

    if (error.response && error.response.status === 401) {

        return
    }

    return Promise.reject(error);
});

export const httpClient = axios

