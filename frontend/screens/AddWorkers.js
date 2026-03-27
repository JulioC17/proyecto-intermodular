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

export default function AddWorkers(){
    const {user, token} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()

    const [loading, setLoading] = useState(false)
    const [workers, setWorkers] = useState([])

    useFocusEffect(
        useCallback(() => {
            getAllWorkers()
        }, []))

    const getAllWorkers = async() => {
        try{
            
            setLoading(true)

            const response = await api.get("/users/getAll", {
                headers: {Authorization: `Bearer ${token}`}
            })

            setWorkers(response.data.data)


        }catch(error){
            const data = error.response?.data
            if(data?.errors){
                console.log(data.errors.join("\n"), "error" )
                        
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
                        <Text style={styles.welcome}>Equipo {user.empresa}</Text>
                    </View>

                     <TouchableOpacity 
                    style={styles.btnView} 
                    onPress={() => navigation.goBack()}>
                        <Ionicons 
                            name = "person-add-outline"
                            size= {26}
                            color = {colorPalette.blanco}
                        /> 
                    </TouchableOpacity>
                    </LinearGradient>
                    <View style = {styles.listView}>
                        <FlatList
                        contentContainerStyle = {{flexGrow:1, paddingBottom:100}}
                        data={workers}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => (
                            <View style = {[styles.cardView, item.rol === "propietario" && styles.owner]}>
                                <View style = {styles.header}>
                                    <Text style = {styles.name}>{item.nombre} {item.apellidos}</Text>
                                    {item.rol === "propietario" ? "" : 
                                    <TouchableOpacity
                                    onPress={() => console.log("hola")}
                                    >
                                    <Ionicons name = "settings-outline" size = {24} color ={colorPalette.azulOscuro}/>
                                    </TouchableOpacity>}
                                </View>
                                <View style = {styles.roleAndMoney}>
                                    <Text style = {styles.rol}>{item.rol}</Text>
                                    <Text style = {styles.money}> {item.sueldo ? `${item.sueldo} €/Mes` : "No Salary"} </Text>
                                </View>
                                <View style = {styles.emailView}>
                                    <Ionicons name = "mail-outline" size = {24} color = {colorPalette.azulOscuro}/>
                                    <Text style = {styles.email}>  {item.email}</Text>
                                </View>
                                
                                <View style = {styles.phoneAndId}>
                                    <View style = {styles.phoneView}>
                                        <Ionicons name = "call-outline" size = {24} color = {colorPalette.azulOscuro}/>
                                        <Text style = {styles.phone}> {item.telefono ? item.telefono : "No Phone"}</Text>
                                    </View>
                                    <View style = {styles.idView}> 
                                        <Ionicons name = "card-outline" size = {24} color = {colorPalette.azulOscuro}/>
                                        <Text style = {styles.id}>  {item.dni}</Text>
                                    </View>
                                    
                                    
                                    
                                </View>
                            </View>
                        )}
                        />
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

    listView:{
        flexGrow:1
    },

    cardView:{
        margin:20,
        borderWidth:1,
        width:330,
        padding:10,
        borderRadius:10,
        borderColor:colorPalette.gris_transparente
    },

    header:{
        flexDirection:"row",
        justifyContent:"space-between",
        borderBottomWidth:1,
        borderColor:colorPalette.gris_transparente,
        alignItems:"center",
        padding:5
    },
    name:{
        fontFamily:"OutfitBold",
        fontSize:18
    },

    roleAndMoney:{
        flexDirection:"row",
        justifyContent:"space-between",
        padding:10
    },

    rol:{
        fontFamily:"OutfitRegular",
        color:"#b7791f",
        fontSize:18,
        backgroundColor:"#fefcbf",
        padding:5,
        borderRadius:10
    },
    money:{
        fontFamily:"OutfitRegular",
        color:"#276749",
        fontSize:18,
        backgroundColor:"#f0fff4",
        padding:5,
        borderRadius:10
    },

    emailView:{
        flexDirection:"row",
        alignItems:"center",
        padding:5
    },

    email:{
        fontFamily:"OutfitRegular",
        fontSize:16
    },

    phoneAndId:{
        flexDirection:"row",
        justifyContent:"space-between",
        padding:10
    },
    phoneView:{
        flexDirection:"row",
        alignItems:"center"
    },
    idView:{
         flexDirection:"row",
        alignItems:"center"
    },

    phone:{
        fontFamily:"OutfitRegular",
        fontSize:18,
        color:colorPalette.gris
    },

    id:{
        fontFamily:"OutfitRegular",
        fontSize:18,
        color:colorPalette.gris
    },

    owner:{
        borderColor:colorPalette.azulOscuro
    }

})