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

export default function DayControl(){
    const {user, token, activeCompany, refresh} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()

    const [loading, setLoading] = useState(false)
    const [checkinUsers, setCheckingUsers] = useState([])
    const [planingToday, setPlanningToday] = useState([])


    useEffect(() => {
        getUserChecksIn()
        getScheduleToday()
        console.log(planingToday)
        console.log(checkinUsers)
    }, [])
    
    const getUserChecksIn = async() => {
        try{

            setLoading(true)
            const hoy = new Date()
            const y = hoy.getFullYear()
            const m = String(hoy.getMonth() + 1).padStart(2, "0")
            const d = String(hoy.getDate()).padStart(2, "0")
            const formatedDate = `${y}-${m}-${d}`
            
            const response = await api.get(`/fichajes/getAllWorkedTIme?id_empresa=${Number(activeCompany.id)}&from=${formatedDate}&to=${formatedDate}`, {
                headers: {Authorization: `Bearer ${token}`}
            })

            setCheckingUsers(response.data.data)

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

    const getScheduleToday = async() => {
        try{

            setLoading(true)
            const hoy = new Date()
            const y = hoy.getFullYear()
            const m = String(hoy.getMonth() + 1).padStart(2, "0")
            const d = String(hoy.getDate()).padStart(2, "0")
            const formatedDate = `${y}-${m}-${d}`

            const response = await api.get(`/turnos/scheduleWeek/${Number(activeCompany.id)}?weekStart=${formatedDate}&weekEnds=${formatedDate}`, {
                headers: {Authorization: `Bearer ${token}`}
            })
    
            setPlanningToday(response.data.schedule)

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

    const ahora = new Date()
    const h = String(ahora.getHours()).padStart(2, "0")
    const m = String(ahora.getMinutes()).padStart(2, "0")
    const s = String(ahora.getSeconds()).padStart(2, "0")
    const formaatedHour = `${h}:${m}:${s}`

    const pendientes = planingToday.filter(p => 
        !checkinUsers.find(c => c.usuario_id === p.usuario_id && 
            c.hora_inicio >= p.hora_inicio &&
            c.hora_inicio <= p.hora_fin
        )
    ).length
    
    return(
         <SafeAreaView style = {{flex:1}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff"}}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>
                   
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
                        <Text style={styles.welcome}>Control de Jornada</Text>
                    </View>
                    </LinearGradient>
                    <View style = {styles.listView}>
                        <Text style = {styles.today}>Hoy, {new Date().toLocaleDateString("es-ES",{
                            day: "2-digit", 
                            month: "long",
                            year: "numeric"
                        })}</Text>

                        <View style = {styles.fastInfoView}>
                            <View style = {styles.fastInfoCard}>
                                <Text style = {styles.fastInfoDescription}>Pendient.</Text>
                                <Text style = {styles.fastInfoPending}>{pendientes}
                            </Text>
                            </View>

                            <View style = {styles.fastInfoCard}>
                                <Text style = {styles.fastInfoDescription}>Activos</Text>
                                <Text style = {styles.fastInfoActive}>{checkinUsers.filter((w) => w.hora_inicio && !w.hora_fin).length}</Text>
                            </View>

                            <View style = {styles.fastInfoCard}>
                                <Text style = {styles.fastInfoDescription}>Complet.</Text>
                                <Text style = {styles.fastInfoCompleted}>{checkinUsers.filter((w) => w.hora_inicio && w.hora_fin).length}</Text>
                            </View>
                        </View>

                        <Text style = {styles.InfoDayDetailsTitle}>REGISTRO DEL DÍA</Text>
                            {planingToday.filter((e) => e.hora_inicio !== "00:00:00" && e.hora_fin !== "23:59:00").map((element, index) => {
                                const chekUser = checkinUsers.find((e) => e.usuario_id === element.usuario_id && 
                                e.hora_inicio >= element.hora_inicio &&
                                e.hora_inicio <= element.hora_fin
                            )
                
                                let estado = ""
                                let horaDeEntrada = ""
                                
                                if(chekUser){
                                    if(chekUser.hora_fin){
                                        estado = "Finalizado"
                                        horaDeEntrada = chekUser.hora_inicio
                                    }else{
                                         estado = "Fichado"
                                         horaDeEntrada = chekUser.hora_inicio
                                    }
                                }else{
                                    if(element.hora_inicio < formaatedHour){
                                        estado = "Retraso"
                                    }else{
                                        estado = "Pendiente"
                                        
                                    }
                                }

                              
                                
                            return(
                                    <View style = {styles.InfoDayDetailsList} key={index}>
                                     <View style = {styles.InfoDayDetailsCard}>
                                    <Text style = {styles.InfoDayDetailsName}>{element.usuario} {element.apellidos}</Text>
                                    <Text style = {[estado === "Finalizado" && styles.finalizado, estado === "Fichado" && styles.fichado, estado === "Retraso" && styles.retraso, estado === "Pendiente" && styles.pendiente,]}>{estado}</Text>
                                </View>

                                <View style = {styles.InfoDayDetailsViewHours}>
                                    <Text style = {styles.InfoDayDetailsCheckin}>Entrada: {element.hora_inicio}</Text>
                                    <Text style = {styles.InfoDayDetailsCheckout}>{element.hora_fin ? `Salida: ${element.hora_fin}` : "--:--"}</Text>
                                    
                                </View>

                                <Text style = {styles.outTimeAndPending}>{horaDeEntrada ? `Fichó a: ${horaDeEntrada}` : "Aún no han fichado"}</Text>
                               </View>
                                )
                            })}
                        

                        

                    </View>
                    </ScrollView>
                    </KeyboardAvoidingView>
                    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    generalView: {
        flexGrow:1,
        justifyContent:"space-between",
        alignItems: "center",
        marginBottom:40,
        paddingBottom:70
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
        flexGrow:1,
        marginTop:10,
        alignItems:"center",
        paddingBottom:100
    },

    today:{
        fontFamily:"OutfitBold",
        fontSize:20
    },

    fastInfoView:{
        flexDirection:"row",
        justifyContent:"space-between",
    },

    fastInfoCard:{
        justifyContent:"center",
        alignItems:"center",
        padding:10,
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        borderRadius:10,
        width:100,
        margin:10,
        marginBottom:25

    },

    fastInfoDescription:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    fastInfoPending:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:"#ffa200"
    },

    fastInfoCompleted:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:"#0dca00"
    },

    fastInfoActive:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.azulOscuro
    },

    InfoDayDetailsTitle:{
         fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.azulOscuro,
        textAlign:"center"
    },

    stateActive:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.azulOscuro
    },

    stateCompleted:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:"#0dca00"
    },

    InfoDayDetailsList:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:15,
        margin:10,
        borderRadius:10,
        width:320,
        gap:10,

    },

    InfoDayDetailsCard:{
        flexDirection:"row",
        justifyContent:"space-between"
    },

    InfoDayDetailsName:{
        fontFamily:"OutfitBold",
        fontSize:18,
    },

    InfoDayDetailsViewHours:{
        flexDirection:"row",
        justifyContent:"space-between"
    },

    InfoDayDetailsCheckin: {
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    InfoDayDetailsCheckout:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    turno:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro
    },

    finalizado:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color: "#0dca00",
        backgroundColor:"#e1ffdf",
        padding:5,
        borderRadius:15
    },

    fichado:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro,
        backgroundColor:colorPalette.azulClaroTrasnparente,
        padding:5,
        borderRadius:15
    },

    retraso:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:"#dd0000",
        backgroundColor:"#ffd9d9",
        padding:5,
        borderRadius:15
    },

    pendiente:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:"#ffa200",
        backgroundColor:"#ffeac6",
        padding:5,
        borderRadius:15
    },

    outTimeAndPending:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color: colorPalette.azulOscuro

    }
})


//cambiar los colores de los estados #dd0000