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

export default function SchedulesConfig(){
    const {user, token} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()

    const [weekStart, setWeekStart] = useState("")//objeto date con dia inicial de la semana
    const [weekEnds, setWeekEnds] = useState("")//objeto date con dia final de la semana
    const [weekStartFormat, setWeekStartFormat] = useState("")//objeto date formateado a (ej: 13 mar)
    const [weekEndsFormat, setWeekEndsFormat] = useState("")//objeto date formateado a (ej: 13 mar)
    const [changeWeek, setChangeWeek] = useState(new Date())//rango de dias de 1 semana
    const [daysOfWeek, setDaysOfWeek] = useState([])//todos los dias dentro de una semna
    const [distributionSchedule, setDistributionSchedule] = useState([])//objeto praa enviar al back y estblecer los horarios
    const [modalVisible, setModalVisible] = useState(false)
    const [selectWeekDayModal, setSelectWeekDayModal] = useState("")//para saber el dia seleccionado en el modal
    const [loading, setLoading] = useState(false)
    const [workers, setWorkers] = useState([])//paara trerme todos lo trbajdores de la bbdd
    const[selectedWorker, setSelectedWorker] = useState("")//trabjdor seleccionado por el modal
    const [shifts, setShifts] = useState([])//turnos tridos desd la bbdd
    const [selectedShift, setSelectedShift] = useState("")//turno seleccionado por el modal
    const [count, setCount] = useState(0)
    

    const setTime = (base) => {
        const today = new Date(base)//2026-03-19T07:22:07.124Z
        const dayNow = today.getDay()//4 
        const inicio = today.getDate() - dayNow  + (dayNow === 0 ? -6 : 1)//16
        
        today.setDate(inicio)

        const sunday = new Date(today)
        sunday.setDate(today.getDate() + 6)

        setWeekStartFormat(formatLocalDate(today))
        setWeekEndsFormat(formatLocalDate(sunday))
        setDaysOfWeek(getDaysOfWeek(today, sunday))

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

    const formatLocalDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, "0")
        const day = String(date.getDate()).padStart(2, "0")

        return `${year}-${month}-${day}`
}

useEffect(()=> {
    setTime(changeWeek)
},[changeWeek])

useEffect(() => {
    const getWorkers = async () => {
        try{

            setLoading(true)
            const response = await api.get("/users/getAll",{
                headers: {Authorization: `Bearer ${token}`}
            })

            setWorkers(response.data.data)
            

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

    getWorkers()
}, [])

useEffect(() => {
    getShifts()
    }, [])

useEffect(() => {
        
        const getSchedule = async() => {
            try{
    
                setLoading(true)
                setDistributionSchedule([])
                
                const response = await api.get(`/turnos/scheduleWeek/${user.empresa_id}?weekStart=${weekStartFormat}&weekEnds=${weekEndsFormat}`, {
                        headers : {Authorization: `Bearer ${token}`}
                    })
                    
                    setDistributionSchedule(simplifySchedule(response.data.schedule))
                
                    
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
        
    },[weekStartFormat, weekEndsFormat, count])

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

const getDaysOfWeek = (start, ends) => {
    const inicio = new Date(start)
    const days = []

    while(inicio <= new Date(ends)){
        const year = inicio.getFullYear()
        const month = String(inicio.getMonth() + 1).padStart(2, "0")
        const day = String(inicio.getDate()).padStart(2, "0")
        days.push(`${year}-${month}-${day}`)

        inicio.setDate(inicio.getDate() + 1)

    }

    return days
}

const getShifts = async () => {
            try{
                setLoading(true)

                const response = await api.get(`/turnos/getShifts/${Number(user.empresa_id)}`,{
                    headers: {Authorization: `Bearer ${token}`}
                })

                setShifts(response.data.turnos)
                
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

/*const setSchedule = (user, shift, day) => {
    setSelectedShift(shift)
    setSelectedWorker(user)

    const arrayCopy = [...distributionSchedule]
    
    const objDay = arrayCopy.find(obj => obj[day])
        
    if(objDay){
        objDay[day].usuarios_turnos.push({usuario_id:user, turno_id:shift})
    }else{
        arrayCopy.push({
            [day]:{usuarios_turnos: [{usuario_id:user, turno_id:shift}]}
        })
    }

    setDistributionSchedule(arrayCopy)
}*/

const setSchedule = async () => {
    try{

        setLoading(true)

        const response = await api.post(`/turnos/assign/${Number(user.empresa_id)}/${selectedShift}`,{
            usuario_id:Number(selectedWorker),
            fecha: selectWeekDayModal.toISOString().split("T")[0]
        },{
            headers: {Authorization: `Bearer ${token}`}
        })

        showModal(response.data.message, "success")
        setCount(count + 1)
        setModalVisible(false)
        setSelectedShift("")
        setSelectedWorker("")

    }catch(error){
            const data = error.response?.data
            let errorMsj = "Error interno del servidor"
            if(data?.errors){
                errorMsj = data.errors.join("\n")
                
            }else if(data?.error){
                errorMsj = data.error
                
            }

                Alert.alert(
                    "Error",
                    errorMsj,
                    [{
                        text: "Reintentar", style: "default"
                    }]
                )

            }finally{
                setLoading(false)
            }
}

const desasignShift = async (turno_id, usuario_id, fecha) => {

    try{
        setLoading(true)

        const response = await api.delete(`/turnos/remove/${user.empresa_id}/${turno_id}/${usuario_id}/${fecha}`, {
            headers: {Authorization: `Bearer ${token}`}
        })

        showModal(response.data.message, "success")
        setCount(count + 1)

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
                        <Text style={styles.welcome}>Asignar Horarios</Text>
                    </View>

                     
                    <TouchableOpacity 
                    style={styles.btnView} 
                    onPress ={() => navigation.navigate("CrudShifts")}>
                        <Ionicons 
                            name = "create-outline"
                            size= {28}
                            color = {colorPalette.blanco}
                            
                    />     
                    </TouchableOpacity>
            </LinearGradient>
            
                <View style ={styles.listView}>
                    <View style = {styles.dateView}>
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
                {loading && 
                    <View style = {styles.spinnerGeneral}>
                        <ActivityIndicator size="large" color = {colorPalette.azulOscuro}/>
                    </View>}

                {!loading && <FlatList
                data={daysOfWeek}
                keyExtractor={(item, index)=> index.toString()}
                renderItem={({item}) => {
                    return(
                    <View style ={styles.cardView}>
                        <View style ={styles.dayAndButtonView}>
                            <View style ={styles.DayAndWeekDay}>
                                <Text style ={styles.weekDay}>{new Date(item).toLocaleDateString("es-ES", {
                                    weekday: "long"
                                }).toUpperCase()}</Text>
                                <Text style ={styles.Day}>{new Date(item).toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month:"long"
                                })}</Text>
                            </View>
                            <TouchableOpacity 
                            style ={styles.addBtn}
                            onPress={() => {
                                setModalVisible(true)
                                setSelectWeekDayModal(new Date(item))
                                
                            }}
                            >
                                <Ionicons name = "add-outline" color={colorPalette.blanco} size = {20}/>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.cardScheduleView}>
                            {(()=>{
                                const findDay = distributionSchedule.find(s => s.fecha === item)

                                if(findDay && findDay.turnos.length > 0){
                                    return findDay.turnos.map((t, i) => {
                                        const trabajdor = workers.find((w) => w.id === t.usuario_id)
                                        return (
                                        <View style = {styles.cardWTF} key = {i}>
                                            <View style = {styles.nameAndShift}>
                                                <Text style = {styles.nameCard}>{trabajdor?.nombre}</Text>
                                                <Text style = {styles.shiftCard}>{t.nombre}  
                                                    {t.hora_inicio !== "00:00:00" && t.hora_fin !== "23:59:00" && <Text style = {styles.shiftCardHour}> ({t.hora_inicio.slice(0, 5)}-{t.hora_fin.slice(0, 5)})</Text>}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                            onPress={() => {
                                                //desasignShift(t.turno_id, trabajdor.id, item)
                                                Alert.alert(
                                                    "Confirmación",
                                                    "Está seguro de eliminar el horario de este usuario para este día?",
                                                    [{
                                                        text: "Cancelar",
                                                        style: "cancel"
                                                    },{
                                                        text: "Aceptar",
                                                        style: "destructive",
                                                        onPress : () => desasignShift(t.turno_id, trabajdor.id, item)
                                                    }]
                                                )
                                                
                                            }}
                                            >
                                                <Ionicons name = "trash-outline" size ={24} color = "#dd0000"/>
                                            </TouchableOpacity>
                                        </View>
                                        
                                        
                                        
                                    )
                                    })

                                    
                                }else{
                                    return(
                                     <View style={styles.scheduleEmpty}>
                                    <Text style={styles.sinTrabajadores}>No hay trabajadores asignados</Text>
                                    </View>)
                                }
                            } )()}
                        </View>
                    </View>
                    )
                }}
                contentContainerStyle = {{flexGrow:1}}
                />}
                </View>
            </View>
            {modalVisible && 
                <Modal
                animationType="slide"
                visible = {modalVisible}
                onRequestClose={() => setModalVisible(false)}
                >
                    <View style = {styles.modalGeneralView}>
                        <View style = {styles.dayTitleAndCloseBtnView}>
                            <View style = {styles.dayTitleView}> 
                                <Text style = {styles.title}>Asignar Turno</Text>
                                <Text style = {styles.weekdayModal}>{selectWeekDayModal.toLocaleDateString("es-ES", {
                                    day:"2-digit",
                                    weekday: "long",
                                    month:"long"
                                }).toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity
                            style = {styles.closeBtn}
                            onPress={() => setModalVisible(false)}
                            ><Ionicons name = "close-outline" color ={colorPalette.gris} size={30}/></TouchableOpacity>
                        </View>

                        <View style = {styles.selectWorkerView}>
                            <Text style = {styles.selectWorkerText}>SELECCIONA UN TRABAJADOR</Text>
                            <View style = {styles.selectWorkerPicker}> 
                            <Picker
                            selectedValue={selectedWorker}
                            onValueChange={(value) => setSelectedWorker(value)}
                            >
                                <Picker.Item label = "Selecciona un Trabajador" value = "" style = {styles.initPicker}/>
                                {workers.map((w, i) => {
                                    return(
                                        w.rol !== "propietario" && <Picker.Item key = {w.id} label = {w.nombre} value = {w.id} style = {styles.pickers}/>
                                    )
                                })}
                            </Picker>
                            </View>
                        </View>

                        <View style = {styles.selectShiftView}>
                            <Text style = {styles.selectShiftText}>SELECCIONA UN TURNO</Text>
                            <View style = {styles.selectShiftPicker}> 
                            <Picker
                            selectedValue={selectedShift}
                            onValueChange={(value) => setSelectedShift(value)}
                            >
                                <Picker.Item label = "Selecciona un Turno" value = "" style = {styles.initPicker}/>
                                {shifts.map((w, i) => {
                                    return(
                                        <Picker.Item key = {w.id} label = {`${w.nombre} (${w.hora_inicio.slice(0, 5)}-${w.hora_fin.slice(0, 5)})`} value = {w.id} style = {styles.pickers}/>
                                    )
                                })}
                            </Picker>
                            </View>
                        </View>
                        <View style ={styles.btnView}>
                            <Button
                            backgroundColor={colorPalette.azulOscuro}
                            width={320}
                            height={60}
                            text={loading ? <ActivityIndicator size="small" color="#fff"/> : "Guardar Turno"}
                            colorText={colorPalette.blanco}
                            fontSize={20}
                            action={() => {
                                if(!selectedShift || !selectedWorker){
                                    return Alert.alert(
                                        "Error!",
                                        "Por Favor selecciona usuario y turno antes de guardar",
                                        [{
                                            text:"Entendido",
                                            style: "cancel"
                                        }]
                                    )}
                                    
                                    setSchedule()
                                

                            }}
                            disabled={loading}
                            />
                        </View>
                        
                    </View>
                </Modal>}
            
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
    dateView:{
        margin:15,
        flexDirection:"row",        
        justifyContent:"space-between",
        width:350
    },

    cardView:{
        
        padding:10,
        borderRadius:10,
        margin:10,
        
    },

    dayAndButtonView:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        backgroundColor:"#f3f3f3",
        padding:10,
        borderRadius:10

    },
    listView:{
        flex:1
    },

    weekDay:{
        fontFamily:"OutfitBold",
        fontSize:16
    },

    Day:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    addBtn:{
        borderWidth:1,
        width:30,
        height:30,
        backgroundColor: colorPalette.azulOscuro,
        borderColor:colorPalette.azulOscuro,
        justifyContent:"center",
        alignItems:"center",
        borderRadius:5
    },

    modalGeneralView:{
        flex:1,
        padding:20,
        marginTop:20
    },

    dayTitleAndCloseBtnView:{
        flexDirection:"row",
        justifyContent:"space-between"
    },

    title:{
        fontFamily:"OutfitBold",
        fontSize:24,
    },

    weekdayModal:{
        fontFamily:"OutfitBold",
        fontSize:20,
        color:colorPalette.azulOscuro
    },

    closeBtn:{
        borderWidth:1,
        borderRadius:100,
        width:40,
        height:40,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:colorPalette.gris_transparente,
        borderColor:colorPalette.gris_transparente
    },

    selectWorkerView:{
        padding:20
    },

    selectWorkerText:{
        fontFamily:"OutfitBold",
        fontSize:18
    },
    selectWorkerPicker:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        borderRadius:10,
        marginTop:10
    },

    scheduleEmpty:{
         borderWidth:1,
        justifyContent:"center",
        alignItems:"center",
        borderStyle:"dashed",
        borderColor:colorPalette.azulOscuro,
        padding:20,
        margin:5,
        borderRadius:10
    },

    pickers:{
        fontFamily:"OutfitRegular",
        fontSize:18
    },

    selectShiftView:{
        padding:20
    },

    selectShiftText:{
        fontFamily:"OutfitBold",
        fontSize:18
    },

    selectShiftPicker:{
         borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        borderRadius:10,
        marginTop:10
    },

    btnView:{
        justifyContent:"center",
        alignItems:"center",
        marginTop:20
    },

    nameCard:{
        fontFamily:"OutfitBold",
        fontSize:16,
    },

    nameAndShift:{
        borderBottomWidth:1,
        padding:5,
        width:300,
        borderColor:colorPalette.gris_transparente,
    },

    shiftCard:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro
    },

    shiftCardHour:{
        fontFamily:"OutfitRegular",
        fontSize:16,
        color:colorPalette.gris
    },

    cardWTF:{
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        marginTop:5
    },

    spinnerGeneral:{
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    }
      

})

/*
<View style = {styles.scheduleEmpty}>
                                <Text style = {styles.sinTrabajdores}>Sin Trabajdores</Text>
                            </View> : <Text>Hola</Text>


                            (new Date(item).toLocaleDateString("es-ES", {
                                    day:"2-digit",
                                    weekday: "long",
                                    month:"long"
                                }).toUpperCase())
*/