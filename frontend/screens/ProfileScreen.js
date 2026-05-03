import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import {Ionicons} from "@expo/vector-icons"
import Button from "../components/Button";
import { AuthContext } from "../context/AuthProvider";


export default function Profile() {
    const navigation = useNavigation()
    const {showModal} = useContext(AlertContext)
    const {user, token, logout} = useContext(AuthContext)

    const [loading, setLoading] = useState(false)
    const [userProfile, setUserProfile] = useState([])

    useEffect(()=> {
        getUserProfile()
    }, [])

    const getUserProfile = async () => {
        try{

            setLoading(true)

            const response = await api.get("/users/me", {
                headers: {Authorization: `Bearer ${token}`}
            })

            setUserProfile(response.data.user)


        }catch(error){
            const data = error.response?.data
            console.log(error)
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
                        <Text style={styles.welcome}>{user.nombre} {user.apellidos}</Text>
                    </View>
                    </LinearGradient>

                    <View style = {styles.listView}>
                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>DATOS DE LA CUENTA</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Nombre:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{user.nombre} {user.apellidos}</Text>
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Email:</Text>
                                    <Text 
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style = {styles.textEmail}> {user.email}</Text>
                                </View>
                            </View>
                        </View>

                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>INFORMACIÓN PERSONAL</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>DNI / NIE:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{user.dni}</Text>
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Teléfono:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{user.telefono ? user.telefono : "No registrado"}</Text>
                                </View>
                            </View>
                        </View>

                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>CONTRATO Y EMPRESA</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Empresa:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{user.rol === "propietario" ? 
                                    <TouchableOpacity 
                                    onPress={() => navigation.navigate("CompanyManagement")}
                                    style = {styles.companyBtn}>
                                        <Text style = {styles.companyText}>Mis Empresas</Text>
                                    </TouchableOpacity>
                                    : user.empresa}</Text>
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Rol:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{user.rol}</Text>
                                </View>

                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Sueldo:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{user.sueldo ? `${user.sueldo} €`  : "No disponible"}</Text>
                                </View>
                            </View>
                        </View>

                        <Button
                        backgroundColor={"#fef2f2"}
                        width={280}
                        height={60}
                        borderColor={"#ffc1c1"}
                        text={"Cerrar Sesión"}
                        colorText={"#ef4444"}
                        fontSize={20}
                        disabled={loading}
                        action={() => {
                        logout()
            
                    }}
                        />

                    </View>
                    </ScrollView>
                    </KeyboardAvoidingView>
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
        height:120
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

    btnView:{
        position:"absolute",
        left:20
    },

    titleAndSection:{
        justifyContent:"center",
        alignItems:"center"
    },

    listView:{
        flex:1,
        marginTop:20,
        gap:20,
        justifyContent:"center",
        alignItems:"center"
    },

    infoCards:{
        width:320,
        justifyContent:"center",
        gap:10,
        margin:10
        
    },

    infoCardsContentView:{
        borderRadius:10,
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:15,
        gap:20
    },
    infoCardsTitle:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro
    },

    infoCardsContent:{
        flexDirection:"row",
        justifyContent:"space-between",
        
    },

    infoCardsContentTextTitle:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    infoCardsContentTextDescription:{
        fontFamily:"OutfitBold",
        fontSize:16,
    },

    companyText:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro
    },

    textEmail:{
        maxWidth:"85%",
        fontFamily:"OutfitBold",
        fontSize:16,
    }

})