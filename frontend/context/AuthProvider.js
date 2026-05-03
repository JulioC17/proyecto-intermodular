import React, {createContext, useState, useEffect, useContext} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { api } from "../services/api"
import { AlertContext } from "../context/AlertProvider";


export const AuthContext = createContext()


export const AuthProvider = ({ children }) => {
    const {showModal} = useContext(AlertContext)

    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)
    const [verifyEmail, setVerifyEmail] = useState(null)
    const [recipe, setRecipe] = useState(null)
    const [activeCompany, setActiveCompany] = useState({})

    useEffect(()=> {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            async(error) => {
                if(error.response && error.response.status === 401 && !error.config.url.includes("/auth/login")){
                    showModal("Tu sesión ha caducado. Inicie Sesión de nuevo", "error")
                    await logout()
                    return new Promise(() => {})
                }
                return Promise.reject(error)
            }
        )
        return () => {
            api.interceptors.response.eject(interceptor)
        }
    }, [])

    

    useEffect(() => {
        const loadStorage = async () => {

            try{
                const storedToken = await AsyncStorage.getItem("token")
                const storedUser = await AsyncStorage.getItem("user")
                const pendingEmail = await AsyncStorage.getItem("pendingEmail")
                
            if(storedToken && storedUser){
                    
                    setToken(storedToken)
                    const parsedUser = JSON.parse(storedUser)
                    setUser(parsedUser)

                    if(parsedUser.rol !== "propietario"){
                        setActiveCompany({id: parsedUser.empresa_id, empresa: parsedUser.empresa})
                    }
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

            const response = await api.get("/users/me", {
                headers: {Authorization : `Bearer ${userToken}`}
            })

            response.data.user.nombre[0].toUpperCase()
            
            
            if(response.data.user.rol === "propietario"){
                try{

                    const responseCompanies = await api.get("/company/viewCompany", {
                        headers: {Authorization: `Bearer ${userToken}`}
                    })

                    const copyUser = response.data.user
                    copyUser.empresa = responseCompanies.data.companys
                    setUser(copyUser)
                    setActiveCompany({id:null, empresa:""})
                    
                
                }catch(error){
                    const data = error.response?.data
                    if(data?.errors){
                        showModal(data.errors.join("\n"), "error")
                
                    }else if(data?.error){
                        showModal(data.error, "error")
                
                    }else{
                        showModal("Error interno del servidor", "error")
                    }
                }
            }else{
                setUser(response.data.user)
                setActiveCompany({id:response.data.user.empresa_id, empresa: response.data.user.empresa})
            }

            
            
            
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
    }}

    const logout = async () => {
        setUser(null)
        setToken(null)
        await AsyncStorage.removeItem("token")
        await AsyncStorage.removeItem("user")
    }

    const refresh = async() => {
        if(user.rol === "propietario"){
            try {

                const responseCompanies = await api.get("/company/viewCompany", {
                        headers: {Authorization: `Bearer ${token}`}
                    })

                    const updateUser = {...user, empresa: responseCompanies.data.companys}
                    setUser(updateUser)
                    await AsyncStorage.setItem("user", JSON.stringify(updateUser))

            }catch(error){
            const data = error.response?.data
            if(data?.errors){
                showModal(data.errors.join("\n"), "error")
                
            }else if(data?.error){
                showModal(data.error, "error")
                
            }else{
                showModal("Error interno del servidor", "error")
            }
    }
        }
    }

    return (

        <AuthContext.Provider value={{user, token, login, logout, loading, setLoading, verifyEmail, setVerifyEmail, recipe, setRecipe, activeCompany, setActiveCompany, refresh}}>
            {children}
        </AuthContext.Provider>
    )
}