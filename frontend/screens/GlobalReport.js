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


export default function GlobalReport(){
    const {user, token, activeCompany} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()

    const [currentMonth, setCurrentMonth] = useState("")
    const [firstDayMonth, setFirstDayMonth] = useState("")
    const [lastDayMonth, setLastDayMonth] = useState("")
    const [loading, setLoading] = useState(false)
    const [countOfHours, setCountOfHours] = useState([])

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
        getHours()
        
    }, [firstDayMonth, lastDayMonth, currentMonth])

    const getHours = async() => {
        try{

            setLoading(true)
            setCountOfHours([])
            const response = await api.get(`/fichajes/getAllWorkedTIme?id_empresa=${Number(activeCompany.id)}&from=${firstDayMonth}&to=${lastDayMonth}`, {
                headers: {Authorization: `Bearer ${token}`}
            })

            const datosReady = reorgaanizeHours(response.data.data)
            setCountOfHours(datosReady)

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

    const calculateTotalHours = ( fecha ,start, end) => {
        const getDate = new Date(fecha)
        const y = getDate.getFullYear()
        const m = String(getDate.getMonth() + 1).padStart(2, "0")
        const d = String(getDate.getDate()).padStart(2, "0")
        const formatedDate = `${y}-${m}-${d}`
        const inicio = new Date(`${formatedDate}T${start}Z`).getTime()
        let final = new Date (`${formatedDate}T${end}Z`).getTime()

        if(final < inicio){
            final = final + (24*60*60*1000)
        }

        const totalMS = final - inicio
        return totalMS
        
    }

    const reorgaanizeHours = (dataArray) => {
        const reduce = dataArray.reduce((acc, worker) => {
            
            if(!acc[worker.usuario_id]){
                acc[worker.usuario_id] = {
                    usuario_id: worker.usuario_id,
                    nombre: worker.nombre,
                    apellidos: worker.apellidos,
                    totalMS:0,
                    desgloce:[]
                }
            }

            acc[worker.usuario_id].desgloce.push({fecha:worker.fecha, inicio: worker.hora_inicio, fin: worker.hora_fin})

            
            if(worker.hora_inicio && worker.hora_fin){
                const parcialMS = calculateTotalHours(worker.fecha, worker.hora_inicio, worker.hora_fin)
                acc[worker.usuario_id].totalMS += parcialMS
            }
            return acc
            

        }, {})

        return Object.values(reduce)

    }

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

const formatMStoHours = (ms) => {
    const hours = Math.floor(ms/ (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
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
                        <Text style={styles.welcome}>Control de Horas</Text>
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
                        
                        <FlatList
                        data={countOfHours}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity style = {styles.cardView} onPress={() => navigation.navigate("WorkerMonthResumen", {
                                usuario: {
                                    nombre: item.nombre,
                                    apellidos: item.apellidos,
                                    desgloce:item.desgloce
                                }
                            })}>
                                
                                
                                <Text style = {styles.cardName}>{item.nombre} {item.apellidos}</Text>
                                
                                <Text style = {styles.cardHourNumbers}>{formatMStoHours(item.totalMS)}</Text>
                                
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={!loading && 

                            <View style = {styles.emptylistView}>
                                <Text style = {styles.emptyListText}>No hay Registros</Text>
                            </View>
                        }
                        >

                        </FlatList>

                        {loading && 
                    <View  style = {styles.spinner}>
                        <ActivityIndicator size="large" color={colorPalette.azulOscuro}/>
                    </View>
                    }

                        
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

     selectMonthView:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-between",
        width:350,
        margin:20
    },

    currentMonthText:{
        fontFamily:"OutfitBold",
        fontSize:20,
        color:colorPalette.azulOscuro
    },

    listView:{
        flex:1
    },

    cardView:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:10,
        margin:10,
        borderRadius:10,
        justifyContent:"space-between",
        paddingBottom:20,
        paddingTop:20,
        flexDirection:"row",
        alignItems:"center"

    },

    cardName:{
        fontFamily:"OutfitBold",
        fontSize:18
    },

    cardHourText:{
         fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.gris
    },

    cardHourNumbers:{
         fontFamily:"OutfitBold",
        fontSize:24,
        color:colorPalette.azulOscuro
    },

    totalHoursGradient:{
        alignSelf:"flex-start",
        padding:10
    },

    nameAndHoursView:{
        gap:5
    },

    desgloceText:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    desgloceNumber:{
        fontFamily:"OutfitBold",
        fontSize:22,
        color:"#22c55e"
    },

    spinner:{
        justifyContent:"center",
        alignItems:"center",
        position:"absolute",
        top:0,
        bottom:0,
        left:0,
        right:0
    },

    emptylistView:{
        justifyContent:"center",
        alignItems:"center",
    },
    emptyListText:{
        fontFamily:"OutfitBold",
        fontSize:20
    }

})