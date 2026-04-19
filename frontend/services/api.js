import axios from "axios"

export const api = axios.create({
    baseURL: "https://hostech-api-5ewi.onrender.com/",
    timeout:10000
})

//render-conection:"https://hostech-api-5ewi.onrender.com/"
//local-conection:"http://192.168.1.143:5001"