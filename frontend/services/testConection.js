import { api } from "./api";

 export const testConection = async () => {
    try{
        const response = await api.get("ping")
        console.log("respuesta correcta del backend", response.data)
    }catch(error){
console.error("error conectando al backend", error.message)

    }
}