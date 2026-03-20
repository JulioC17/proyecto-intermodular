import axios from "axios"

export const api = axios.create({
    baseURL: "http://192.168.1.131:5001",
    timeout:5000
})