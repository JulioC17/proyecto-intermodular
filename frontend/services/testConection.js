import { api } from "./api";

 export const testConection = async () => {
    try{
        const response = await api.get("ping")
        console.log(response.data.message)
    }catch(error){
console.error("error conectando al backend", error.message)

    }
}