import React, {useCallback, useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator} from "react-native";
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
import DashboardOwner from "../components/DashboardOwner";


export default function Dashboard(){
    const {user, activeCompany, setActiveCompany, token} = useContext(AuthContext)
    const navigation = useNavigation()
    const {showModal}= useContext(AlertContext)
    const [initTime, setInitTime] = useState(null)
    
    const [loading, setLoading] = useState(false)

    

    useFocusEffect(
        useCallback(() => {
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
    getActualTime()
    },[]))

    const sayHello = () => {
    const now = new Date()

    if(now.getHours() > 20){
        return "Buenas Noches"
    }

    if(now.getHours() > 12){
        return "Buenas Tardes"
    }

    if(now.getHours() > 0)
        return "Buenos Días"
    }    


    return(
        <SafeAreaView style = {{flex:1}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff"}}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>
                   
                   <LinearGradient style={styles.brandView} colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}}>

                    { user.rol === "propietario" && activeCompany.empresa && <TouchableOpacity 
                    style={styles.btnView} 
                    onPress={() => setActiveCompany({id: null, empresa: ""})}>
                        <Ionicons 
                            name = "arrow-back"
                            size= {26}
                            color = {colorPalette.blanco}
                        /> 
                    </TouchableOpacity>}

                        <View style={styles.headerView}>
                        <Text style={styles.hostech}>{activeCompany.empresa ? activeCompany.empresa : "HOSTECH"}</Text>
                        <Text style={styles.welcome}>{`${sayHello()} ${user?.nombre}`}</Text>
                        </View>
                        <TouchableOpacity 
                        style={styles.profileIcon}
                        onPress={() => navigation.navigate("Profile")}
                        >
                            <Ionicons name = "person-circle-outline" color = {colorPalette.blanco} size = {40}/>
                        </TouchableOpacity>
                    </LinearGradient>

                    <View style = {styles.cardSection}>
                       { user.rol === "administrador" ? 
                       <DashboardAdmins estado = {initTime}/> : 
                       user.rol === "propietario" ?( 
                            activeCompany.id ? 
                            <DashboardAdmins/> :
                            <DashboardOwner restaurants={user.empresa}/>) : 
                       <DashboardWorker estado={initTime}/>}
                    </View>

            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    generalView: {
        flexGrow: 1, 
        alignItems: "center",
        paddingBottom: 40 
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
        fontSize:22,
        fontFamily:"OutfitRegular",
        color:colorPalette.blanco
    },

    profileIcon:{
        position:"absolute",
        right:20,
        top:30
    },

    headerView:{
        justifyContent:"center",
        alignItems:"center"
    },

    cardSection:{
        flexGrow:1
    },
    btnView:{
        position:"absolute",
        left:20
    },
})