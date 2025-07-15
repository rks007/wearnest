import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true, // SEND COOKIE WITH REQUESTS
})

export default axiosInstance;