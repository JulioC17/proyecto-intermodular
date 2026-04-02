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

export default function Turnos(){
    const navigation = useNavigation()
    const {user, token, activeCompany} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    
    const [loading, setLoading] = useState(false)
    const [weekStart, setWeekStart] = useState("")
    const [weekEnds, setWeekEnds] = useState("")
    const [weekStartFormat, setWeekStartFormat] = useState("")
    const [weekEndsFormat, setWeekEndsFormat] = useState("")
    const [changeWeek, setChangeWeek] = useState(new Date())
    const [schedule, setSchedule] = useState([])
    const [focusBtn, setFocusBtn] = useState("personal")

    const formatLocalDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")

        return `${year}-${month}-${day}`
    }

const setTime = (base) => {
        const today = new Date(base)//2026-03-19T07:22:07.124Z
        const dayNow = today.getDay()//4 
        const inicio = today.getDate() - dayNow  + (dayNow === 0 ? -6 : 1)//16
        
        today.setDate(inicio)

        const sunday = new Date(today)
        sunday.setDate(today.getDate() + 6)

        setWeekStartFormat(formatLocalDate(today))
        setWeekEndsFormat(formatLocalDate(sunday))

        const lunes = today.toLocaleDateString("es-ES",{
            day: "2-digit",
            month: "short"
        })
        const domingo = sunday.toLocaleDateString("es-ES",{
            day: "2-digit",
            month: "short"
        })

        setWeekStart(lunes)
        setWeekEnds(domingo)
}

const simplifySchedule = (scheduleDate) => {
    const grouped = scheduleDate.reduce((acc, turno) => {
        if(!acc[turno.fecha]){
            acc[turno.fecha] = []
        }
        acc[turno.fecha].push(turno) 
        return acc
        
    }, {})

    return Object.entries(grouped).map(([fecha, turnos]) => ({fecha, turnos}))
}

useEffect(()=> {
    setTime(changeWeek)
    
}, [changeWeek])

useFocusEffect(
    useCallback(() => {
    
    const getSchedule = async() => {
        try{

            
            setLoading(true)
            setSchedule([])
            
            if(focusBtn === "personal"){
                const response = await api.get(`/turnos/schedule/me?weekStart=${weekStartFormat}&weekEnds=${weekEndsFormat}`, {
                    headers : {Authorization: `Bearer ${token}`}
                })
                
                setSchedule(simplifySchedule(response.data.schedule))
            
            }else if(focusBtn === "general"){
                const response = await api.get(`/turnos/scheduleWeek/${activeCompany.id}?weekStart=${weekStartFormat}&weekEnds=${weekEndsFormat}`, {
                    headers : {Authorization: `Bearer ${token}`}
                })
                
                setSchedule(simplifySchedule(response.data.schedule))
            }
                
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

    getSchedule()
    
},[weekStartFormat, weekEndsFormat, focusBtn]))



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
                    style={[styles.btnView, user.rol === "trabajador" && styles.btnViewAlter]} 
                    onPress={() => navigation.goBack()}>
                        <Ionicons 
                            name = "arrow-back"
                            size= {26}
                            color = {colorPalette.blanco}
                        /> 
                    </TouchableOpacity>

                    <View style ={styles.titleAndSection}>
                        <Text style={styles.hostech}>{"HOSTECH"}</Text>
                        <Text style={styles.welcome}>Horarios</Text>
                    </View>

                    { (user.rol === "administrador" || user.rol === "propietario") && 
                    <TouchableOpacity 
                    style={styles.btnView} 
                    onPress ={() => navigation.navigate("SchedulesConfig")}>
                        <Ionicons 
                            name = "settings-outline"
                            size= {28}
                            color = {colorPalette.blanco}
                            
                    />     
                    </TouchableOpacity>}
            </LinearGradient>
            <View style = {styles.nextAndPastView}>
                                    <TouchableOpacity 
                                    style = {[styles.nextView, focusBtn === "personal" && styles.focusedBtn]}
                                    onPress={() => {
                                        setFocusBtn("personal")
                                    }}
                                    >
                                        <Text 
                                        style = {[styles.nextText, focusBtn === "personal" && styles.nextTextFocused]}
                                        >Personal</Text>
                                    </TouchableOpacity>
            
                                    <TouchableOpacity 
                                    style  = {[styles.nextView, focusBtn === "general" && styles.focusedBtn]}
                                    onPress={() => {
                                        setFocusBtn("general")
                                    }}>
                                        <Text 
                                        style = {[styles.nextText, focusBtn === "general" && styles.pastTextFocused]}
                                        >General</Text>
                                    </TouchableOpacity>
                                </View>
            <View style = {styles.listView}>
            <View style ={styles.weeksView}>
                <TouchableOpacity onPress={() => {
                    const prev = new Date(changeWeek)
                    prev.setDate(changeWeek.getDate() - 7)
                    setChangeWeek(prev)
                    
                }}>
                <Ionicons 
                    name = "chevron-back-outline"
                    size= {28}
                    color = {colorPalette.azulOscuro}
                /> 
                </TouchableOpacity>

                
                <Text style = {styles.weeksDays}>{weekStart}/{weekEnds}</Text>   

                <TouchableOpacity 
                onPress={() => {
                    const next = new Date(changeWeek)
                    next.setDate(changeWeek.getDate() + 7)
                    setChangeWeek(next)
                }}>  
                <Ionicons 
                    name = "chevron-forward-outline"
                    size= {28}
                    color = {colorPalette.azulOscuro}
                /> 
                </TouchableOpacity>
            </View>

            

            <View style = {styles.cardScheduleViews}>
                {loading && 
                    <View style = {styles.spinnerView}>
                        <ActivityIndicator size="large" color={colorPalette.azulOscuro} />
                    </View>
                }
                {!loading && <FlatList
                data={schedule}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => 
                (
                    <View style = {styles.cardView}>
                        <View style = {styles. cardSubView}>
                            <Text style = {styles.weekDayText}>{(new Date(item.fecha).toLocaleDateString("es-ES",{
                                weekday: "long"
                            })).toUpperCase()}  {item.fecha.split("-")[2]} de {new Date(item.fecha).toLocaleDateString("es-ES", {
                                month:"long"
                            }).split("-")[0]}</Text>
                        </View> 
                            
                        <View style = {styles. cardSubView}>
                           {item.turnos.map((t, i) => {
                            return (
                                <View style={[styles.shiftView, styles.checkIn, t.hora_inicio === "00:00:00" && t.hora_fin === "23:59:00" && styles.restDayView]} key={i}>
                                    <Text style = {styles.tittle}>{t.usuario}</Text>
                                    <View style = {styles.hoursView}>
                                        <Text style = {[styles.checkIn, t.hora_inicio === "00:00:00" && t.hora_fin === "23:59:00" && styles.restDay]}>{t.hora_inicio === "00:00:00" && t.hora_fin === "23:59:00" ? "Día de Descanso" : `De ${t.hora_inicio.slice(0, 5)} a ${t.hora_fin.slice(0, 5)}`}</Text>
                                            
                                    </View>
                                </View>
                                
                            )
                           })}
                        </View>

                    </View>
                )
                }
                ListEmptyComponent={
                <View style = {{flex:1 ,justifyContent: "center", alignItems:"center"}}>
                    <Text style = {{fontFamily:"OutfitBold", fontSize:20}}>No hay horarios disponibles aún</Text>
                </View>    
                    }
                contentContainerStyle={{flexGrow:1}}
                />}
            </View>

            </View>
            </View>
            </KeyboardAvoidingView>
            </SafeAreaView>)
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

    listView:{
        flex:1,
        marginTop:10
    },

    weeksView:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        width:350,
        padding:10,
        borderRadius:15,
        borderColor:colorPalette.gris_transparente
    },

    weeksDays:{
        fontFamily:"OutfitRegular",
        fontSize:20,
        color:colorPalette.azulOscuro
    },
    cardView:{
        justifyContent:"space-between",
        padding:20,
        borderBottomWidth:1,
        borderColor:colorPalette.gris_transparente
    },

    cardSubView:{
        gap:5,
    },
     weekDayText:{
        color:colorPalette.azulOscuro,
        fontFamily:"OutfitBold",
        fontSize:18
},

    monthDay:{

    fontFamily:"OutfitBold",
    fontSize:16
},

    shiftName:{
    fontFamily:"OutfitBold",
    fontSize:16
},

    hours:{
        fontFamily:"OutfitRegular",
        fontSize:16,
        color:colorPalette.gris
    },
    
    hoursView:{
        flexDirection:"row",
        justifyContent:"space-between",

    },

    tittle:{
        fontFamily:"OutfitBold",
        fontSize:18
    },

    checkIn:{
        fontFamily:"OutfitRegular",
        fontSize:17
    },

    checkInOur:{
        fontFamily:"OutfitRegular",
        fontSize:16
    },
    btnViewAlter:{
        position:"absolute",
        left:20
    },

    spinnerView:{
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    },
    nextAndPastView:{
        flexDirection:"row",
        gap:20,
        padding:5,
        marginTop:5
    },

    nextView:{
        backgroundColor:colorPalette.blanco,
        width:150,
        height:45,
        justifyContent:"center",
        alignItems:"center",
        borderRadius:15,
        shadowColor:colorPalette.negro,
        shadowOffset:{width:5, height:5},
        shadowOpacity:1,
        elevation:8,
        borderWidth:2,
        borderColor: colorPalette.blanco,
    },
    nextText:{
        fontFamily:"OutfitRegular",
        fontSize:18,
        color:colorPalette.azulOscuro
    },

    focusedBtn:{
         backgroundColor:colorPalette.azulOscuro,
        width:150,
        height:45,
        justifyContent:"center",
        alignItems:"center",
        borderRadius:15,
        shadowColor:colorPalette.negro,
        shadowOffset:{width:5, height:5},
        shadowOpacity:1,
        elevation:8,
        borderWidth:2,
        borderColor: colorPalette.azulOscuro,
    },

    nextTextFocused:{
        fontFamily:"OutfitRegular",
        fontSize:18,
        color:colorPalette.blanco
    },
    pastTextFocused:{
        fontFamily:"OutfitRegular",
        fontSize:18,
        color:colorPalette.blanco
    },

    restDay:{
        fontFamily:"OutfitRegular",
        color:colorPalette.azulOscuro
    },

    restDayView:{
        backgroundColor:"#f4f4f4",
        borderRadius:10
    }

    

    

    
})