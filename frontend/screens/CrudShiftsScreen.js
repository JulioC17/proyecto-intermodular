import React, {useCallback, useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, FlatList, Alert, Modal, TouchableWithoutFeedback, Keyboard} from "react-native";
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
import Checkbox from "expo-checkbox"

export default function CrudShifts(){
    const {user, token} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()

    const [loading, setLoading]=useState(false)
    const [loadingBtn, setLoadingBtn] = useState(false)
    const [shifts, setShifts] = useState([])
    const [isFocused, setIsFocused] = useState("")
    const [shiftName, setShiftName] = useState("")
    const [showPicker, setShowPicker] = useState(false)
    const [inHour, setInHour] = useState("toca para modificar")
    const [outHour, setOutHour] = useState("toca para modificar")
    const [restDay, setRestDay] = useState(false)


    
    useEffect(() => {
        getShifts()
    }, [])
    
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
    const deleteShift = async (empresa_id, shift_id) => {
        try{
            
            setLoading(true)
            const response = await api.put(`/turnos/deleteShift/${Number(empresa_id)}/${shift_id}`,{},{
                headers: {Authorization: `Bearer ${token}`}
            })

            showModal(response.data.message, "success")
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
                getShifts()
                setLoading(false)
            }
    }

    const addShift = async () => {
        try{
            
            setLoadingBtn(true)

            const response = await api.post("/turnos/createShift",{
                "nombre":shiftName,
                "hora_inicio": restDay ? "00:00:00" : inHour,
                "hora_fin": restDay ? "23:59:00" : outHour,
                "empresa_id": Number(user.empresa_id)
            },{headers: {Authorization: `Bearer ${token}`}})

            showModal(response.data.message, "success")

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
                setLoadingBtn(false)
                getShifts()
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
                    style={styles.btnViewAlter} 
                    onPress={() => navigation.goBack()}>
                        <Ionicons 
                            name = "arrow-back"
                            size= {26}
                            color = {colorPalette.blanco}
                        /> 
                    </TouchableOpacity>

                    <View style ={styles.titleAndSection}>
                        <Text style={styles.hostech}>{"HOSTECH"}</Text>
                        <Text style={styles.welcome}>Configurar Turnos</Text>
                    </View>
            </LinearGradient>
            
            <View style = {styles.listView}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style = {styles.editShifts}>
                    <View style = {styles.newShiftName}>
                        <Text style = {styles.newShiftNameText}>Nombre del Turno</Text>
                        <TextInput 
                        style = {[styles.newShiftNameinput, isFocused === "inputName" && styles.isFocused]}
                        placeholder={restDay ? "ej: Día de Descanso" : "ej: Turno de Mañana"}
                        onChangeText={(text) => setShiftName(text)}
                        onFocus={() => setIsFocused("inputName")}
                        onBlur={() => setIsFocused("")}
                        value={shiftName}
                        />
                        <View style = {styles.checkView}>
                            <Checkbox
                            value ={restDay}
                            onValueChange={setRestDay}

                            />
                            <Text>Día de descanso</Text>
                        </View>
                    </View>
                    <View style = {[styles.newShiftHours]}>
                        <View style = {styles.hours}>
                            <Text style = {styles.newShiftHoursIn}>Desde</Text>
                            <TouchableOpacity
                            style = {[styles.newShiftHoursInInput, isFocused === "inputIn" && styles.isFocused, restDay && styles.disabled]}
                            onPress={() => {
                                setIsFocused("inputIn")
                                setShowPicker(true)
                            }}
                            disabled = {restDay}
                            >
                                <Text style = {styles.hora}>{restDay ? "Descanso" : inHour}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style = {styles.hours}> 
                            <Text style = {styles.newShiftHoursOut}>Hasta</Text>
                            <TouchableOpacity
                            style = {[styles.newShiftHoursInInput, isFocused === "inputOut" && styles.isFocused, restDay && styles.disabled]}
                            onPress={() => {
                                setIsFocused("inputOut")
                                setShowPicker(true)
                            }}
                            disabled = {restDay}
                            >
                                <Text style = {styles.hora}>{restDay ? "Descanso" : outHour}</Text>
                            </TouchableOpacity>
                            </View>
                        </View>
                        <Button
                        backgroundColor={colorPalette.azulOscuro}
                        width={280}
                        height={60}
                        borderColor={colorPalette.azulOscuro}
                        text={loadingBtn ? <ActivityIndicator size="small" color={colorPalette.blanco}/> : "Guardar Turno"}
                        colorText={colorPalette.blanco}
                        fontSize={20}
                        action={() => {
                            addShift()
                            setInHour("toca para modificar")
                            setOutHour("toca para modificar")
                            setShiftName("")
                        }}
                        disabled={loadingBtn}

                        />
                </View>
                </TouchableWithoutFeedback>        
                
                {loading && <View style = {styles.spinnerView}><ActivityIndicator size="large" color={colorPalette.azulOscuro}/></View>}
                {!loading && <FlatList
                
                data={shifts}
                keyExtractor={(item, index) => index.toString()}
                ListHeaderComponent={<Text style= {styles.Shifts}>Turnos Configurados</Text>}
                renderItem={({item}) => (
                    <View>
                        <View style = {[styles.shiftCard]}>
                        <View style = {styles.descriptionView}>
                            <Text style = {styles.shiftName}>{item.nombre}</Text>
                            <Text style = {styles.checkIn}>De {item.hora_inicio.slice(0, 5)} a {item.hora_fin.slice(0, 5)}</Text>
                        </View>

                        <View style = {styles.btnView}>
                            <TouchableOpacity 
                            style = {styles.deleteBtn}
                            onPress={() => {
                                Alert.alert(
                                    "Eliminar Turno",
                                    "¿Seguro que quieres eliminar este turno?",
                                    [{
                                        text:"Cancelar",
                                        style:"cancel"
                                    },{
                                        text:"Aceptar",
                                        onPress: () => {
                                            deleteShift(item.empresa_id, item.id)
                                            
                                        }
                                    }]
                                )
                            }}
                            >
                                <Ionicons
                                name = "trash-outline"
                                color = "#dd0000"
                                size = {28}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    </View>
                )}
                contentContainerStyle={{flexGrow:1}}
                ListEmptyComponent={<View style = {styles.empty}>
                    <Text style = {styles.emptyText}>No hay turnos creados aún</Text>
                </View>}
                />}
            </View>
            </View>
            {showPicker && (
                <DateTimePicker
                    mode = "time"
                    value = {new Date()}
                    is24Hour={true}
                    display={"spinner"}
                    onChange={(event, selectedDate) => {
                        setShowPicker(false)
                        if(selectedDate){
                            const h = selectedDate.getHours().toString().padStart(2, "0")
                            const m = selectedDate.getMinutes().toString().padStart(2, "0")
                            
                            if(isFocused === "inputIn"){
                                setInHour(`${h}:${m}:00`)
                            }else if(isFocused === "inputOut"){
                                setOutHour(`${h}:${m}:00`)
                            }
                        }
                    }}
                />
            )}
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
    btnViewAlter:{
        position:"absolute",
        left:20
    },

    shiftCard:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        borderBottomWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:5,
        width:350
    },
    btnView:{
        flexDirection:"row",
        gap:10
    },
    listView:{
        flex:1,
        width:350,
        alignItems:"center"
    },

    Shifts:{
        fontFamily:"OutfitBold",
        fontSize:20,
        color:colorPalette.azulOscuro,
        justifyContent:"center",
        alignItems:"center"
    },

    shiftName:{
        fontFamily:"OutfitBold",
        fontSize:18
    },

    checkIn:{
        fontFamily:"OutfirRegular",
        fontSize:16
    },

    checkout:{
        fontFamily:"OutfirRegular",
        fontSize:16
    },

    company:{
        fontFamily:"OutfitBold",
        fontSize:24,
        color:colorPalette.azulOscuro
    },

    spinnerView:{
        flex:1,
        justifyContent:"center",
        alignItems:"center"
    },

    editShifts:{
        width:320,
        gap:15,
        justifyContent:"center",
        alignItems:"center",
        margin:20,
    },

    newShiftName:{
        marginTop:10,
        gap:5,
        justifyContent:"center",
        alignItems:"center"
    },
   newShiftNameText:{
    fontFamily:"OutfitBold",
    fontSize:18
   },

   newShiftNameinput:{
    borderWidth:1,
    borderRadius:10,
    borderColor:colorPalette.gris_transparente,
    fontFamily:"OutfitRegular",
    fontSize:16,
    width:320,
    padding:15
   },

   newShiftHours:{
    flexDirection:"row",
    justifyContent:"space-around",
    width:350
   },

   hours:{
    justifyContent:"center",
    alignItems:"center"
   },

   newShiftHoursIn:{
    fontFamily:"OutfitBold",
    fontSize:18,
    textAlign:"center"
   },

   hora:{
    fontFamily:"OutfitRegular",
    fontSize:16,
    textAlign:"center"
   },

   newShiftHoursInInput:{
    borderWidth:1,
    borderRadius:10,
    borderColor:colorPalette.gris_transparente,
    fontFamily:"OutfitRegular",
    fontSize:16,
    width:160,
    paddingTop:10,
    paddingBottom:10
   },

   newShiftHoursOut:{
    fontFamily:"OutfitBold",
    fontSize:18,
   },
   
   isFocused:{
    borderWidth:1,
    borderColor:colorPalette.azulOscuro
   },

   empty:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
   },

   emptyText:{
    fontFamily:"OutfitBold",
    fontSize:18
   },

   checkView:{
    flexDirection:"row",
    gap:10,
    justifyContent:"flex-start",
    width:310,
    margin:5
   },

   disabled:{
    backgroundColor:colorPalette.gris_transparente,
    borderWidth:1,
    borderColor:colorPalette.azulOscuro
   }


    
})


/*
<TextInput
                            style = {[styles.newShiftHoursInInput, isFocused === "inputIn" && styles.isFocused]}
                            onFocus={() => {
                                setIsFocused("inputIn")
                                setShowPicker(true)
                            }}
                            onBlur={() => setIsFocused("")}
                            />
*/