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

export default function Resumen(){
    const {user, token} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()
    
    const [loading, setLoading] = useState(false)
    const [currentMonth, setCurrentMonth] = useState("")
    const [firstDayMonth, setFirstDayMonth] = useState("")
    const [lastDayMonth, setLastDayMonth] = useState("")
    const [workedTime, setWorkedTime] = useState([])
    const [totalHours, setTotalHours] = useState(0)

    useEffect(() => {
        const date = new Date()
        const m = String(date.getMonth() + 1).padStart(2, "0")
        const y = date.getFullYear()
        const d = String(date.getDate()).padStart(2, "0")
        const mLast = new Date(y, date.getMonth() + 1, 0).getDate()

        const newDate = `${y}-${m}-${d}`
        const firstDay = `${y}-${m}-01`
        const lastDay = `${y}-${m}-${mLast}`
        
        

        setCurrentMonth(newDate)
        setFirstDayMonth(firstDay)
        setLastDayMonth(lastDay)
        
        
},[])

    useEffect(() => {
       getWorkedTime() 
    }, [currentMonth, firstDayMonth])

    const changeMonthBack = (month) => {
        const actualDate = new Date(month)
        const newMonth = actualDate.getMonth()-1
        actualDate.setMonth(newMonth)

        const m = String(actualDate.getMonth() + 1).padStart(2, "0")
        const y = actualDate.getFullYear()
        const d = String(actualDate.getDate()).padStart(2, "0")
        const mLast = new Date(y, actualDate.getMonth() + 1, 0).getDate()
        
        const newDate = `${y}-${m}-${d}`
        const firstDay = `${y}-${m}-01`
        const lastDay = `${y}-${m}-${mLast}`
        
        setCurrentMonth(newDate)
        setFirstDayMonth(firstDay)
        setLastDayMonth(lastDay)
}

const changeMonthForward = (month) => {
        const actualDate = new Date(month)
        const newMonth = actualDate.getMonth() + 1
        actualDate.setMonth(newMonth)

        const m = String(actualDate.getMonth() + 1).padStart(2, "0")
        const y = actualDate.getFullYear()
        const d = String(actualDate.getDate()).padStart(2, "0")
        const mLast = new Date(y, actualDate.getMonth() + 1, 0).getDate()
        
        const newDate = `${y}-${m}-${d}`
        const firstDay = `${y}-${m}-01`
        const lastDay = `${y}-${m}-${mLast}`
        setCurrentMonth(newDate)
        setFirstDayMonth(firstDay)
        setLastDayMonth(lastDay)
}

const getWorkedTime =  async () => {
    
    try{
        setLoading(true)

        const response = await api.get(`/fichajes/myWorkedTime?from=${firstDayMonth}&to=${lastDayMonth}`, {
            headers: {Authorization: `Bearer ${token}`}
        })

        showModal(response.data.message || "Horas trabajadas recuperados con Éxito", "success")
        setWorkedTime(simplifyHours(response.data.data))

        const newData = simplifyHours(response.data.data)
        let sumSec = 0
        const totalSec =newData.map((item, index) => {
            const date = new Date(item.fecha)
            const y = date.getFullYear()
            const m = String(date.getMonth() + 1).padStart(2, "0")
            const d = String(date.getDate()).padStart(2, "0")
            const formatedDate = `${y}-${m}-${d}`
    
            
            const bucle = item.description.map((obj, indice) => {
                const newInitDate = new Date(`${formatedDate}T${obj.hora_inicio}`).getTime()
                const newFinalDate = new Date(`${formatedDate}T${obj.hora_fin}`).getTime()
        
                const diference = newFinalDate - newInitDate
                sumSec += diference
            })

            
        })

        setTotalHours(sumSec)

    }catch(error){
            const data = error.response?.data
            if(data?.errors){
                console.log(data.errors.join("\n"), "error" )
                        
            }else if(data?.error){
                console.log(data.error, "error")
                        
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
}

const simplifyHours = (object) => {
    const reduce = object.reduce((acc, description) => {
        if(!acc[description.fecha]){
            acc[description.fecha] = []
        }

        acc[description.fecha].push(description)
        return acc
    }, {})


    return Object.entries(reduce).map(([fecha, description]) => ({fecha,description})) 
}

const sumHours = (description, fecha) => {
    const date = new Date(fecha)
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, "0")
        const d = String(date.getDate()).padStart(2, "0")
        const formatedDate = `${y}-${m}-${d}`
    
        let sumSec = 0

    const getHours = description.map((obj, ind) => {
        const newInitDate = new Date(`${formatedDate}T${obj.hora_inicio}`).getTime()
        const newFinalDate = new Date(`${formatedDate}T${obj.hora_fin}`).getTime()
        
        const diference = newFinalDate - newInitDate
        sumSec += diference
    })

    const totalSeconds = Math.floor(sumSec/1000)
    
             const hour = Math.floor(totalSeconds / 3600)
            const min = Math.floor((totalSeconds % 3600) / 60)
            const sec = Math.floor(totalSeconds % 60)

            const hh = String(hour).padStart(2, "0")
            const mm = String(min).padStart(2, "0")
            const ss = String(sec).padStart(2, "0")

            const formatTime = `${hh}h ${mm}m` 

            return formatTime
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
                        <Text style={styles.welcome}>Análisis de Horas</Text>
                    </View>
                    </LinearGradient>

                    <View style = {styles.listView}>
                        <View style = {styles.selectMonthView}>
                            <TouchableOpacity
                            onPress={() => {
                                changeMonthBack(currentMonth)
                            }}
                            >
                                <Ionicons name = "chevron-back" size = {28} color = {colorPalette.azulOscuro}/>
                            </TouchableOpacity>
                            <Text style = {styles.currentMonthText}>{new Date(currentMonth).toLocaleDateString("es-ES", {
                                month:"long",
                                year:"numeric"
                            }).toUpperCase()}</Text>
                            <TouchableOpacity
                            onPress={() => {changeMonthForward(currentMonth)}}
                            >
                                <Ionicons name = "chevron-forward" size = {28} color = {colorPalette.azulOscuro}/>
                            </TouchableOpacity>

                        </View>

                        <View style = {styles.statsGeneralView}>
                            <View style = {styles.statsView}>
                                <Text style = {styles.statsTitle}>TOTAL MES</Text>
                                <Text style = {styles.statsNumber}>{Math.floor(totalHours/ 1000/ 3600)} h</Text>
                            </View>

                            <View style = {styles.statsView}>
                                <Text style = {styles.statsTitle}>DIAS TRAB.</Text>
                                <Text style = {styles.statsNumber}>{workedTime.length}</Text>
                            </View>

                            <View style = {styles.statsView}>
                                <Text style = {styles.statsTitle}>PROM. DIA</Text>
                                <Text style = {styles.statsNumber}>{workedTime.length > 0 ? (Math.floor(totalHours/ 1000/ 3600) / workedTime.length).toFixed(1) : 0}</Text>
                            </View>
                        </View>

                        <View style = {styles.listDaysView}>
                        {loading && <View style = {styles.emptyList}><ActivityIndicator size="large" color={colorPalette.azulOscuro}/></View>} 
                          {!loading && <FlatList
                            style = {{flexGrow:1}}
                            data={workedTime}
                            ListHeaderComponent={<Text style = {styles.listTitle}>{workedTime.length > 0 ? "DESGLOCE DEL MES" : "NO HAY DATOS AUN"}</Text>}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) => (
                                <View style = {styles.card}>
                                    <Text style = {styles.cardDate}>{new Date(item.fecha).toLocaleDateString("es-ES", {
                                            weekday:"long",
                                            month:"short",
                                            day:"2-digit"
                                        }).toUpperCase()}</Text>
                                    <Text style = {styles.cardTime}>{sumHours(item.description, item.fecha)}</Text>
                                </View>
                            )}
                            contentContainerStyle = {{flexGrow:1}}
                            />}


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
    listView:{
        flex:1
    },

    selectMonthView:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-between",
        width:350,
        margin:10
    },

    currentMonthText:{
        fontFamily:"OutfitBold",
        fontSize:20,
        color:colorPalette.azulOscuro
    },

    statsGeneralView:{
        flexDirection:"row",
        justifyContent:"space-between",
        margin:10,
        alignItems:"center"
    },

    statsView:{
        justifyContent:"center",
        alignItems:"center",
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:10,
        borderRadius:10,
    },

    statsTitle:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    statsNumber:{
        fontFamily:"OutfitBold",
        fontSize:20,
        color:colorPalette.azulOscuro
    }, 

    card:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        padding:10,
        borderBottomWidth:1,
        borderColor:colorPalette.gris_transparente
    },

    cardDate:{
        fontFamily:"OutfitBold",
        fontSize:18
    },

    cardTime:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro,
        padding:8,
        borderWidth:1,
        borderRadius:10,
        borderColor:colorPalette.gris_transparente
    },

    listTitle:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro
    },
    listDaysView:{
        marginTop:20
    },

    emptyList: {
        justifyContent:"center",
        alignItems:"center",
        flex:1
        
    }



})


/** 
 * [{"fecha":"2026-03-24T23:00:00.000Z",
 *    "description":[
 * {"id":"38",
 * "hora_inicio":"08:37:48",
 * "hora_fin":"08:38:43",
 * "fecha":"2026-03-24T23:00:00.000Z",
 * "usuario_id":"75",
 * "empresa_id":"8"
 * },{
 * "id":"33",
 * "hora_inicio":"07:10:59",
 * "hora_fin":"07:12:02",
 * "fecha":"2026-03-24T23:00:00.000Z",
 * "usuario_id":"75",
 * "empresa_id":"8"
 * },
 * {
 * "id":"34",
 * "hora_inicio":"07:14:50",
 * "hora_fin":"07:15:53",
 * "fecha":"2026-03-24T23:00:00.000Z",
 * "usuario_id":"75",
 * "empresa_id":"8"
 * },
 * {
 * "id":"35", 
 * "hora_inicio":"08:10:56",
 * "hora_fin":"08:12:13",
 * "fecha":"2026-03-24T23:00:00.000Z",
 * "usuario_id":"75",
 * "empresa_id":"8"},{"id":"36","hora_inicio":"08:12:19","hora_fin":"08:13:21","fecha":"2026-03-24T23:00:00.000Z","usuario_id":"75","empresa_id":"8"},{"id":"37","hora_inicio":"08:20:11","hora_fin":"08:22:03","fecha":"2026-03-24T23:00:00.000Z","usuario_id":"75","empresa_id":"8"}]},{"fecha":"2026-03-23T23:00:00.000Z","description":[{"id":"22","hora_inicio":"08:37:38","hora_fin":"09:06:18","fecha":"2026-03-23T23:00:00.000Z","usuario_id":"75","empresa_id":"8"},{"id":"23","hora_inicio":"09:06:22","hora_fin":"09:07:41","fecha":"2026-03-23T23:00:00.000Z","usuario_id":"75","empresa_id":"8"},{"id":"24","hora_inicio":"09:07:47","hora_fin":"09:13:23","fecha":"2026-03-23T23:00:00.000Z","usuario_id":"75","empresa_id":"8"},{"id":"26","hora_inicio":"09:39:56","hora_fin":"09:39:57","fecha":"2026-03-23T23:00:00.000Z","usuario_id":"75","empresa_id":"8"},{"id":"27","hora_inicio":"09:44:00","hora_fin":"09:44:05","fecha":"2026-03-23T23:00:00.000Z","usuario_id":"75","empresa_id":"8"}]},{"fecha":"2026-03-22T23:00:00.000Z","description":[{"id":"21","hora_inicio":"23:51:00","hora_fin":"23:51:26","fecha":"2026-03-22T23:00:00.000Z","usuario_id":"75","empresa_id":"8"}]}]
 * 
 * 
*/