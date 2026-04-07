import axios from "axios"

export const api = axios.create({
    baseURL: "https://hostech-api-5ewi.onrender.com/",
    timeout:10000
})