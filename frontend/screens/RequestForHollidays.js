import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, FlatList, Alert, Modal} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import {Ionicons} from "@expo/vector-icons"
import Button from "../components/Button";
import { AuthContext } from "../context/AuthProvider";
import DateTimePicker from "@react-native-community/datetimepicker"

export default function RequestForHollidays(){
        const {user, token} = useContext(AuthContext)
        const {showModal} = useContext(AlertContext)
        const navigation = useNavigation()

        const [fechaInicio, setFechaInicio] = useState("")
        const [fechaFin, setFechaFin] = useState("")
        const [showPicker, setShowPicker] = useState(false)
        const [currentMode, setCurrentMode] = useState(null)
        const [isModalVisible, setModalVisible] = useState(false)
        const [loading, setLoading] = useState(false)

        const requestForHolidays = async () => {
                try {
        
                    setLoading(true)
        
                    const response = await api.post("/hollidays/requestHollidays",{
                        "fecha_inicio": fechaInicio,
                        "fecha_fin": fechaFin
                    },{headers: {Authorization: `Bearer ${token}`}})
        
                    showModal(response.data.message, "success")
                    navigation.goBack()
        
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

        const onChange = (event, selectedDate) => {
        setShowPicker(false)

        if(selectedDate){
            if(currentMode === "inicio"){
                setFechaInicio(selectedDate)
            }else{
                setFechaFin(selectedDate)
            }
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
                        <Text style={styles.welcome}>Fechas de Vacaciones</Text>
                    </View>
            </LinearGradient>

                <View style = {styles.listView}>
                    <View style = {styles.dates}>

                        <Text style ={styles.header}>Seleccione las fechas para sus futuras vacaciones</Text>
                        
                        <View style={styles.container}>
                        <Text style={styles.title}>Seleccione una fecha de Inicio</Text>
                        <TouchableOpacity 
                        style={styles.selectBtnView}
                        onPress={() => {
                            setShowPicker(true)
                            setCurrentMode("inicio")
                        }}
                        >
                            <Text style={styles.selectBtnText}>{fechaInicio ? fechaInicio.toLocaleDateString("es-ES",{
                                                day: "2-digit",
                                                month: "short",
                                                year : "numeric"
                                            }) : "toca para elegir..."}</Text>
                        </TouchableOpacity>
                        </View>

                        <View style={styles.container}>
                        <Text style={styles.title}>Seleccione una fecha de Fin</Text>
                        <TouchableOpacity 
                        style={styles.selectBtnView}
                        onPress={() => {
                            setShowPicker(true)
                            setCurrentMode("fin")
                        }}
                        >
                            <Text style={styles.selectBtnText}>{fechaFin ? fechaFin.toLocaleDateString("es-ES",{
                                                day: "2-digit",
                                                month: "short",
                                                year : "numeric"
                                            }) : "toca para elegir..."}</Text>
                        </TouchableOpacity>
                        </View>
                        
                        <Button
                        backgroundColor={colorPalette.azulOscuro}
                        width={350}
                        height={60}
                        borderColor={colorPalette.azulOscuro}
                        text = {loading ? <ActivityIndicator color = "#fff" size="small"/> : "Enviar Solicitud"}
                        colorText={colorPalette.blanco}
                        fontSize={20}
                        action={() => {
                            requestForHolidays()
                             }}
                        disabled={!fechaInicio || !fechaFin}
                        />
                    </View>
                    
                </View>
            </View>
            </KeyboardAvoidingView>
            {showPicker && 
                <DateTimePicker
                value = {new Date()}
                mode="date"
                display="default"
                onChange={onChange}
                />
            }
            </SafeAreaView>        
    )
}

const styles = StyleSheet.create({
    generalView: {
        flex:1,
        justifyContent:"space-between",
        alignItems: "center",
        marginBottom:40
    },

    brandView:{
        width:"100%",
        justifyContent:"center",
        alignItems:"center",
        height:120,
        marginBottom:10,
        flexDirection:"row"
    },

    hostech:{
        fontSize:28,
        fontFamily:"OutfitExtraBold",
        color:colorPalette.blanco
    },

    welcome:{
        fontSize:20,
        fontFamily:"OutfitBold",
        color:colorPalette.blanco
    },
    titleAndSection:{
        justifyContent:"center",
        alignItems:"center"
    },

    btnViewAlter:{
        position:"absolute",
        left:20
    },
    listView:{
        flex:1
    },

    dates:{
        justifyContent:"center",
        alignItems:"center",
        width:350,
        gap:10
    },

    header:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.gris,
        textAlign:"center",
        marginBottom:20
    },

    container:{
        justifyContent:"center",
        alignItems:"center",
        width:"100%"
        
    },

    title:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.gris,
        textAlign:"left",
    },
    selectBtnView:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:20,
        borderRadius:15,
        width:"100%",
        justifyContent:"center",
        alignItems:"center",
        margin:15
    },

    selectBtnText:{
        fontFamily:"OutfitBold",
        fontSize:20,
        color:colorPalette.negro,
        textAlign:"left",
    }

   

})

/*
<Modal
            visible={isModalVisible}
            animationType="slide"
            transparent = {false}
            onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name = "close" size = {30}/>
                            </TouchableOpacity>

                            <Text>Pedir Vacaciones</Text>

                            <TouchableOpacity 
                            onPress={() => {
                                setCurrentMode("inicio")
                                setShowPicker(true)
                                }}>
                                
                                <Text>Desde: {fechaInicio ? fechaInicio.toLocaleDateString() : "Seleccionar"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                            onPress={() => {
                                setCurrentMode("fin")
                                setShowPicker(true)
                            }}
                            >
                                <Text>Hasta: {fechaFin ? fechaFin.toLocaleDateString() : "Seleccionar"}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                            disabled = {!fechaInicio || !fechaFin}
                            onPress={() => requestForHolidays()}
                            >
                                <Text>Enviar Solicitud</Text>
                            </TouchableOpacity>
                            
                            {showPicker && (
                                <DateTimePicker
                                    value={new Date()}
                                    mode = "date"
                                    display="default"
                                    onChange={onChange}
                                />
                            )}
                </SafeAreaView>    
            </Modal>
*/