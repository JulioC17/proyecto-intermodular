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

export default function Vacaciones(){
    const {user, token, activeCompany} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()

    const [loading, setLoading] = useState(false)
    const [vacaciones, setVacaciones] = useState([])
    const [count, setCount] = useState(false)
    const [focusBtn, setFocusBtn] = useState("nextBtn")
    

    useFocusEffect(
        useCallback(()=>{
            
       const getHolidays = async() =>{
         try{

            setLoading(true)

            if(user.rol === "trabajador"){
                const response = await api.get(`/hollidays/getHollidays`,{
                headers: {Authorization: `Bearer ${token}`}
                })

                if(focusBtn === "nextBtn"){
                    const nextHolidays = response.data.data.filter(hd => new Date(hd.fecha_inicio) >= new Date())
                    setVacaciones(nextHolidays)
                }

                if(focusBtn === "pastBtn"){
                    const nextHolidays = response.data.data.filter(hd => new Date(hd.fecha_inicio) <= new Date())
                    setVacaciones(nextHolidays)
                }
                

            }else{
                const idToFind = user.rol === "propietario" ? Number(activeCompany?.id): Number(user.empresa_id)

                const response = await api.get(`/hollidays/getAllHollidays/${idToFind}`,{
                headers: {Authorization: `Bearer ${token}`}
                })
                
                if(focusBtn === "nextBtn"){
                    const nextHolidays = response.data.data.filter(hd => new Date(hd.fecha_inicio) >= new Date())
                    setVacaciones(nextHolidays)
                }

                if(focusBtn === "pastBtn"){
                    const nextHolidays = response.data.data.filter(hd => new Date(hd.fecha_inicio) <= new Date())
                    setVacaciones(nextHolidays)
                }
                
            }


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

       getHolidays()
    }, [token, user, count, focusBtn]))

    const handleHolidays = async (id, estado) => {
        try{

            setLoading(true)

            const response = await api.put(`/hollidays/handdleHollidays/${id}`,{
                "estado":estado
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
                        <Text style={styles.welcome}>Vacaciones</Text>
                    </View>

                    <TouchableOpacity 
                    style={styles.btnView} 
                    onPress={() => navigation.navigate("RequestForHollidays")}>
                        <Ionicons 
                            name = "add"
                            size= {28}
                            color = {colorPalette.blanco}
                            
                        />     
                    </TouchableOpacity>
            </LinearGradient>
                    <View style = {styles.nextAndPastView}>
                        <TouchableOpacity 
                        style = {[styles.nextView, focusBtn === "nextBtn" && styles.focusedBtn]}
                        onPress={() => {
                            setFocusBtn("nextBtn")
                        }}
                        >
                            <Text 
                            style = {[styles.nextText, focusBtn === "nextBtn" && styles.nextTextFocused]}
                            >Próximas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                        style  = {[styles.nextView, focusBtn === "pastBtn" && styles.focusedBtn]}
                        onPress={() => {
                            setFocusBtn("pastBtn")
                        }}>
                            <Text 
                            style = {[styles.nextText, focusBtn === "pastBtn" && styles.pastTextFocused]}
                            >Pasadas</Text>
                        </TouchableOpacity>
                    </View>
                    <View style = {styles.listView}>
                        <FlatList
                            data={vacaciones}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) => 
                            (
                                <TouchableOpacity 
                                style = {styles.vacacionesCard}
                                disabled = {user.rol === "trabajador" || item.estado || item.estado === false}
                                onPress={() => {
                                    Alert.alert(
                                        `Vacaciones de ${item.nombre}`,
                                        `${
                                            new Date(item.fecha_inicio).toLocaleDateString("es-ES",{
                                                day: "2-digit",
                                                month: "short",
                                                year : "numeric"
                                            })} - ${new Date(item.fecha_fin).toLocaleDateString("es-ES",{
                                                day: "2-digit",
                                                month: "short",
                                                year : "numeric"
                                            })}`,
                                        [{
                                            text: "Salir",
                                            style: "cancel"
                                            
                                        },{
                                            text: "Aprobar",
                                            onPress: () => {
                                                handleHolidays(item.id, true)
                                                setCount(!count)
                                            }
                                        },{
                                            text:"Denegar",
                                            onPress: () => {
                                                handleHolidays(item.id, false)
                                                setCount(!count)
                                            }
                                        }]
                                    )
                                }}
                                >
                                    <View style = {styles.dateAndNameView}>
                                        {user.rol === "trabajador" ? 
                                        <Text style = {styles.solicitud}>Mi Solicitud</Text> :
                                        <Text style = {styles.nombre}>{`${item.nombre} ${item.apellidos}`}</Text>
                                        }
                                        {user.rol === "propietario" && <Text style = {styles.empresaVacaciones}>Empresa: {item.empresa}</Text>}
                                        <Text style = {styles.fecha}>{`${new Date(item.fecha_inicio).toLocaleDateString("es-ES",{
                                                day: "2-digit",
                                                month: "short",
                                                year : "numeric"
                                            })} - ${new Date(item.fecha_fin).toLocaleDateString("es-ES",{
                                                day: "2-digit",
                                                month: "short",
                                                year : "numeric"
                                            })}`}</Text>
                                    </View>
                                    <View style = {styles.estadoView}>
                                        <Text 
                                        style = {item.estado === true ? styles.aprobado : item.estado === false ? styles.rechazado : styles.pendiente}
                                        >{item.estado === true ? "Aceptada" : item.estado === false ? "Rechazada" : "Pendiente"}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                            }
                            ListEmptyComponent={(
                                <View style = {{flex:1, justifyContent:"center", alignItems:"center"}}>
                                    <Text style = {styles.emptyText}>No hay información disponible aquí</Text>
                                </View>
                            )}

                            contentContainerStyle={{flexGrow:1}}
                        />

                    </View>

                </View>
            </KeyboardAvoidingView>
            {loading && <View style = {styles.spinner}>
                        <ActivityIndicator color = {colorPalette.azulOscuro} size="large"/>
                </View>}

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
        justifyContent:"space-around",
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
        fontSize:22,
        fontFamily:"OutfitRegular",
        color:colorPalette.blanco
    },
    titleAndSection:{
        justifyContent:"center",
        alignItems:"center"
    },
    listView:{
        flex:1
    },

    spinner:{
        position:"absolute",
        top:0,
        bottom:0,
        left:0,
        right:0,
        backgroundColor:"rgba(255, 255, 255, 0.7)",
        justifyContent:"center",
        alignItems:"center",
        zIndex:10
    },
    vacacionesCard:{
        width:350,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        padding:10,
        borderBottomWidth:1,
        borderColor:colorPalette.gris_transparente,
        margin:5,
    },

    dateAndNameView:{
        gap:5,
    },
    aprobado:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:"#009d10",
        padding:4,
    },
    rechazado:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:"#fb0000",
        padding:4,
    },
    pendiente:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:"#ff8000",
        padding:4,
    },

    nombre:{
        fontFamily:"OutfitBold",
        fontSize:16
    },
    fecha:{
        fontFamily:"OutfitRegular",
        fontSize:16

    }, solicitud:{
        fontFamily:"OutfitBold",
        fontSize:16
    },
    nextAndPastView:{
        flexDirection:"row",
        gap:20,
        padding:5
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
    

    emptyText:{
        fontFamily:"OutfitBold",
        fontSize:20
    }

    

    


})