import axios from "axios"

export const api = axios.create({
    baseURL: "http://192.168.1.135:5001",
    timeout:10000
})

//render-conection:"https://hostech-api-5ewi.onrender.com/"
//local-conection: