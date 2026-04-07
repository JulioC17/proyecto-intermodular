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
        const [lastWorked, setLastWorked] = useState([])
        const [count, setCount] = useState(true)

        useEffect(() => {
            getActualTime()
            getLastWorkedTime()

        }, [count])

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
            const isoDate = `${formatDate}T${time}Z`

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
                setCron("00:00:00")
                setCount(!count)

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
                const response = await api.post("/fichajes/checkIn",{}, {
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

        const getLastWorkedTime = async () => {
            try{

                setLoading(true)
                const response = await api.get("/fichajes/lastWorkedTime", {
                    headers: {Authorization: `Bearer ${token}`}
                })

                setLastWorked(simplifyHours(response.data.data))

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

        const simplifyHours = (workedHours) => {
            const grouped = workedHours.reduce((acc, hour) => {
                if(!acc[hour.fecha]){
                    acc[hour.fecha] = []
                }
                acc[hour.fecha].push(hour)
                return acc
            }, {})

            return Object.entries(grouped).map(([fecha, hour]) => ({fecha, hour}))
            
        }

        const calculateWorkedTime = (objArray, fecha) => {
            const date = new Date(fecha)
            const y = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, "0")
            const d = String(date.getDate()).padStart(2, "0")
            const formatedDate = `${y}-${m}-${d}`
            
            let sumaDeMilisegundos = 0
            
            const hours = objArray.map((obj, ind) => {
                const inicio = new Date(`${formatedDate}T${obj.hora_inicio}Z`).getTime()
                let final = new Date(`${formatedDate}T${obj.hora_fin}Z`).getTime()

                if(final < inicio){
                    final = final + (24*60*60*1000)
                }

                const restaInicioFinal = final - inicio
                sumaDeMilisegundos += restaInicioFinal
            })

            const totalSeconds = Math.floor(sumaDeMilisegundos/1000)
            
            const hour = Math.floor(totalSeconds / 3600)
            const min = Math.floor((totalSeconds % 3600) / 60)
            const sec = Math.floor(totalSeconds % 60)

            const hh = String(hour).padStart(2, "0")
            const mm = String(min).padStart(2, "0")
            const ss = String(sec).padStart(2, "0")

            const formatTime = `${hh}h ${mm}m` 

            return formatTime

}

        const formatearHoraLocal = (fechaString, horaString) => {
            if(!fechaString || !horaString) return "--:--"
            const date = new Date(fechaString)
            const y  = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, "0")
            const d = String(date.getDate()).padStart(2, "0")

            const utcDate = new Date(`${y}-${m}-${d}T${horaString}Z`)

            return utcDate.toLocaleTimeString("es-ES", {hour: "2-digit", minute: "2-digit"})
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

                    <ScrollView style = {styles.listView} contentContainerStyle = {styles.ScrollContent}>
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
                            <Text style = {styles.inHourText}>{initTime ? formatearHoraLocal(initTime.fecha, initTime.hora_inicio) : "--:--"}</Text>
                        </View>

                        <ScrollView style={styles.historic} contentContainerStyle = {styles.ScrollContent}>
                         <Text style = {styles.resumenText}>ÚLTIMOS 5 TURNOS</Text>
                         
                            {lastWorked.map((item, index) => {
                                return(
                                    <View key={index} style = {styles.historicCard}>
                                        <View style = {styles.historicCardDay}>
                                        <Text style = {styles.historicCardText}>{new Date(item.fecha).toLocaleDateString("es-ES", {
                                            weekday:"long",
                                        }).toUpperCase()}</Text>
                                         <Text style = {styles.historicCardTextText}>{new Date(item.fecha).toLocaleDateString("es-ES", {
                                            day:"2-digit",
                                            month:"short"
                                        })}</Text>
                                        </View >
                                        <Text style = {styles.historicCardHours}>{calculateWorkedTime(item.hour, item.fecha)}</Text>
                                    </View>
                                )
                            })}   
                    </ScrollView>
                    </View>
                    
                     </ScrollView>
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
        width:300,
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
        flex:1,
        width:"100%"
    },

    clockView:{
        marginTop:20,
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
        margin:30,
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
        padding:10,
        margin:10,
        
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
    },

    historic:{
        marginTop:15,
        paddingBottom:100,
        flexGrow:1
    },

    historicCard:{
        flexDirection:"row",
        justifyContent:"space-between",
        width:350,
        padding:5,
        alignItems:"center",
        borderBottomWidth:1,
        borderColor:colorPalette.gris_transparente
    },

    historicCardText:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.negro
    },

    historicCardTextText:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    historicCardHours:{
        borderWidth:1,
        padding:10,
        borderRadius:10,
        borderColor:colorPalette.gris_transparente,
        color:colorPalette.azulOscuro,
        fontFamily:"OutfitBold",
        fontSize:16
    },

    ScrollContent:{
        alignItems:"center"
    }


   
   
})


 /*   [{"fecha":"2026-03-23T23:00:00.000Z",
        "hour":
            [{"id":"25",
            "hora_inicio":"09:12:49",
            "hora_fin":"16:21:09",
            "fecha":"2026-03-23T23:00:00.000Z",
            "usuario_id":"24",
            "empresa_id":"8"}]
        },
        {"fecha":"2026-03-22T23:00:00.000Z",
            "hour":[{"id":"11","hora_inicio":"20:55:17","hora_fin":"21:49:26","fecha":"2026-03-22T23:00:00.000Z","usuario_id":"24","empresa_id":"8"},       {"id":"13","hora_inicio":"23:23:26","hora_fin":"23:23:49","fecha":"2026-03-22T23:00:00.000Z","usuario_id":"24","empresa_id":"8"},
                {"id":"12","hora_inicio":"21:49:42","hora_fin":"23:11:30","fecha":"2026-03-22T23:00:00.000Z","usuario_id":"24","empresa_id":"8"},
                    {"id":"14","hora_inicio":"23:24:33","hora_fin":"23:24:43","fecha":"2026-03-22T23:00:00.000Z","usuario_id":"24","empresa_id":"8"}]}]
                    */