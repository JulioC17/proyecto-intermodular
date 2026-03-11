import React, {createContext, useState, useEffect} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [verifyEmail, setVerifyEmail] = useState(null)

    useEffect(() => {
        const loadStorage = async () => {

            try{
                const storedToken = await AsyncStorage.getItem("token")

                if(storedToken){
                    setToken(storedToken)
                }
            
            }catch(error){
                console.error(error)
            }finally{
                setLoading(false)
            }
        }

        loadStorage()
    }, [])

    const login = async (userData, userToken) => {
        setUser(userData)
        setToken(userToken)
        await AsyncStorage.setItem("token", userToken)
    }

    const logout = async () => {
        setUser(null)
        setToken(null)
        await AsyncStorage.removeItem("token")
    }

    return (

        <AuthContext.Provider value={{user, token, login, logout, loading, verifyEmail, setVerifyEmail}}>
            {children}
        </AuthContext.Provider>
    )
}