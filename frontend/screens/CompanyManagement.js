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


export default function CompanyManagement(){
    const navigation = useNavigation()
    const {showModal} = useContext(AlertContext)
    const {user, token, logout} = useContext(AuthContext)

    const [loading, setLoading] = useState(false)
    const [companys, setCOmpanys] = useState([])

    useEffect(() => {
        getCOmpanys()
        console.log(companys)
    }, [])


    const getCOmpanys = async() => {
        try{

            setLoading(true)
            const response = await api.get("/company/viewCompany", {
                headers: {Authorization: `Bearer ${token}`}
            })

            setCOmpanys(response.data.companys)

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
                        <Text style={styles.welcome}>Mis Empresas</Text>
                    </View>
                    </LinearGradient>

                    {companys.map((e, i) => (
                        <View key={i}>

                        </View>
                    ))}
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
})