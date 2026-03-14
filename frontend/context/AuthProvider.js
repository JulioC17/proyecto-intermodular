import React, {createContext, useState, useEffect} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import {showModal} from "./AlertProvider"
import { api } from "../services/api"


export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [verifyEmail, setVerifyEmail] = useState(null)
    const [recipe, setRecipe] = useState(null)

    

    useEffect(() => {
        const loadStorage = async () => {

            try{
                const storedToken = await AsyncStorage.getItem("token")
                const storedUser = await AsyncStorage.getItem("user")
                const pendingEmail = await AsyncStorage.getItem("pendingEmail")
                
            if(storedToken && storedUser){
                    
                    setToken(storedToken)
                    setUser(JSON.parse(storedUser))
                }
                
            if(pendingEmail){
                    
                    setVerifyEmail(pendingEmail)
                }
            
            }catch(error){
                console.error(error)
            }finally{
                setLoading(false)
            }
        }

        loadStorage()
    }, [])

    const login = async (userToken) => {
        setToken(userToken)
        await AsyncStorage.setItem("token", userToken)
        

        try{

            setLoading(true)

            const response = await api.get("/users/me", {
                headers: {Authorization : `Bearer ${userToken}`}
            })

            setUser(response.data.user)
            await AsyncStorage.setItem("user", JSON.stringify(response.data.user))

        }catch(error){
            const data = error.response?.data
            if(data?.errors){
                showModal(data.errors.join("\n"), "error")
                
            }else if(data?.error){
                showModal(data.error, "error")
                
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
    }

    const logout = async () => {
        setUser(null)
        setToken(null)
        await AsyncStorage.removeItem("token")
        await AsyncStorage.removeItem("user")
    }

    return (

        <AuthContext.Provider value={{user, token, login, logout, loading, setLoading, verifyEmail, setVerifyEmail, recipe, setRecipe}}>
            {children}
        </AuthContext.Provider>
    )
}