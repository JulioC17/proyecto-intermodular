import React, {useCallback, useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, FlatList, Alert, Modal} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import {Ionicons} from "@expo/vector-icons"
import Button from "../components/Button";
import { AuthContext } from "../context/AuthProvider";
import DashboardWorker from "../components/DashboardWorker";
import DashboardAdmins from "../components/DashboardAdmins";
import DateTimePicker from "@react-native-community/datetimepicker"
import {Picker, picker} from "@react-native-picker/picker"

export default function Timer() {
     const {user, token} = useContext(AuthContext)
        const {showModal} = useContext(AlertContext)
        const navigation = useNavigation()

        const [initTime, setInitTime] = useState(null)
        const [loading, setLoading] = useState(false)
        const [cron, setCron] = useState("00:00:00")

        useEffect(() => {
            getActualTime()
        }, [])

        useEffect(() => {
            if(initTime?.hora_inicio){
                const interval = showCron(initTime.hora_inicio, initTime.fecha)
                return () => clearInterval(interval)
            }
        }, [initTime])

        const getActualTime = async () => {
            try{

                const response = await api.get("/fichajes/actualTime", {
                    headers: {Authorization: `Bearer ${token}`}
                })

                setInitTime(response.data.data)
                

            }catch(error){
            const data = error.response?.data
            if(data?.errors){
                showModal(data.errors.join("\n"), "error" )
                        
            }else if(data?.error){
                showModal(data.error, "error")
                        
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
        }

        const showCron = (time, fecha) => {
            const date = new Date(fecha)
            const y = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, "0")
            const d = String(date.getDate()).padStart(2, "0")

            const formatDate = `${y}-${m}-${d}`
            const isoDate = `${formatDate}T${time}`

            const pastTime = new Date(isoDate).getTime()
            
            
            const timer = setInterval(() => {
               const actualTime = new Date().getTime()
                const workedTimeMS = actualTime - pastTime

                const totalSeconds = Math.floor(workedTimeMS/1000)
            
                const hour = Math.floor(totalSeconds / 3600)
                const min = Math.floor((totalSeconds % 3600) / 60)
                const sec = Math.floor(totalSeconds % 60)

                const hh = String(hour).padStart(2, "0")
                const mm = String(min).padStart(2, "0")
                const ss = String(sec).padStart(2, "0")

                const formatTime = `${hh}:${mm}:${ss}` 

                setCron(formatTime)
                
            },1000)

            return timer
        }

        const desfichar = async () => {
            try{
                setLoading(true)

                const response = await api.put("/fichajes/checkOut",{},{
                    headers: {Authorization: `Bearer ${token}`}
                })

                showModal(response.data.message, "success")
                setInitTime(null)

            }catch(error){
            const data = error.response?.data
            if(data?.errors){
                showModal(data.errors.join("\n"), "error" )
                        
            }else if(data?.error){
                showModal(data.error, "error")
                        
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
        }

        const fichar = async () => {
            try{

                setLoading(true)
                const response = await api.post("fichajes/checkIn",{}, {
                    headers: {Authorization: `Bearer ${token}`}
                })

                showModal(response.data.message, "success")
                setInitTime(response.data.data)
            
            }catch(error){
            const data = error.response?.data
            if(data?.errors){
                showModal(data.errors.join("\n"), "error" )
                        
            }else if(data?.error){
                showModal(data.error, "error")
                        
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
        }


        

        return(
        <SafeAreaView style = {{flex:1}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff"}}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style = {styles.generalView}>
                   
                   <LinearGradient style={styles.brandView} colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}}>
                    <TouchableOpacity 
                    style={styles.btnView} 
                    onPress={() => navigation.goBack()}>
                        <Ionicons 
                            name = "arrow-back"
                            size= {26}
                            color = {colorPalette.blanco}
                        /> 
                    </TouchableOpacity>

                    <View style ={styles.titleAndSection}>
                        <Text style={styles.hostech}>{"HOSTECH"}</Text>
                        <Text style={styles.welcome}>Registro de Jornada</Text>
                    </View>
                    </LinearGradient>

                    <View style = {styles.listView}>
                    <View style = {styles.clockView}>
                       
                       <View style = {[styles.ellipseView, initTime && styles.checkView]}>
                            <Text style = {[styles.ellipseText, initTime && styles.checkText]}>
                               {initTime ? "Fichado" : "Fuera de turno"}
                            </Text>
                        </View>
                        
                        <View style = {styles.cronView}>
                        <Text style = {styles.cron}>{cron}</Text>
                        <Text style = {styles.cronText}>TIEMPO TRABAJADO HOY</Text>
                        </View>

                        <TouchableOpacity 
                        style = {[styles.ficharBtn, initTime && styles.desficharBtn]}
                        onPress={() => {
                            
                            if(initTime){
                                desfichar()
                                setCron("00:00:00")
                            }else{
                                fichar()
                            }
                        
                        }}
                        disabled = {loading}
                        
                        >
                            <Ionicons name = {initTime ? "stop-outline" : "play-outline"} size = {30} color={colorPalette.blanco}/>
                            <Text style = {styles.ficharText}>{loading ? <ActivityIndicator size="small" color={colorPalette.blanco}/> : (initTime ? "Desfichar" : "Fichar")}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style = {styles.inHourView}>
                        <Text style = {styles.resumenText}>RESUMEN DEL DÍA</Text>
                        <View style = {styles.inView}>
                            <Text style = {styles.inText}>Hora de Entrada</Text>
                            <Text style = {styles.inHourText}>{initTime ? initTime.hora_inicio.slice(0, 5) : "--:--"}</Text>
                        </View>
                    </View>
                    </View>
                    </View>
                    </KeyboardAvoidingView>
                    </SafeAreaView>
        )
}

const styles = StyleSheet.create({
    generalView: {
        flex:1,
        justifyContent:"space-between",
        alignItems: "center",
        marginBottom:40,
    },

    brandView:{
        width:"100%",
        justifyContent:"space-around",
        alignItems:"center",
        height:120,
        flexDirection:"row",
        gap:30
    },
    
    hostech:{
        fontSize:28,
        fontFamily:"OutfitExtraBold",
        color:colorPalette.blanco
    },

    titleAndSection:{
        justifyContent:"center",
        alignItems:"center"
    },

    welcome:{
        fontSize:22,
        fontFamily:"OutfitRegular",
        color:colorPalette.blanco
    },

    btnView:{
        position:"absolute",
        left:20
    },

    ficharBtn: {
        backgroundColor: colorPalette.azulOscuro,
        width:320,
        height:65,
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"row",
        gap:10,
        borderWidth:1,
        borderColor:colorPalette.azulOscuro,
        shadowColor:colorPalette.negro,
        shadowOffset:{width:5, height:5},
        shadowOpacity:1,
        elevation:8,
        borderRadius:15,
    },

    ficharText:{
        fontFamily:"OutfitBold",
        fontSize:24,
        color:colorPalette.blanco,
        
    },
    listView:{
        flex:1
    },

    clockView:{
        marginTop:40,
        padding:30,
        borderRadius:15,
        justifyContent:"center",
        alignItems:"center"
    },

    ellipseView:{
        backgroundColor:colorPalette.gris_transparente,
        padding:10,
        borderRadius:50,
        width:150,
        justifyContent:"center",
        alignItems:"center",
        borderColor:colorPalette.gris,
        borderWidth:1
    },

    ellipseText:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },
    cronView:{
        justifyContent:"center",
        alignItems:"center",
        margin:20,
        height:100,
        width:300
    },
    cron:{
        fontFamily:"OutfitBold",
        fontSize:60,
        color:colorPalette.azulOscuro,
        fontVariant: ["tabular-nums"],  
        textAlign:"center"
    },

    cronText:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.gris
    }, 
    
    checkView:{
        backgroundColor: "#c9ffc4",
        borderWidth:1,
        borderColor:"#11c600"
    },

    checkText:{
        color: "#11c600"
    },

    desficharBtn:{
        backgroundColor:"#ff4e4e",
        borderColor:"#ff4e4e"
    },

    inHourView:{
        justifyContent:"center",
        alignItems:"flex-start",
        marginTop:20,
        padding:40,
    },

    resumenText:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.azulOscuro
    },

    inView:{
        flexDirection:"row",
        justifyContent:"space-between",
        width:350
    },

    inText: {
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.gris
    },

    inHourText:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.negro
    }


    

})