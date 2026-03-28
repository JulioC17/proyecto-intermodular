import React, {useContext, useState} from "react";
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

export default function FirstLogin({route}){
        const navigation = useNavigation()
        const {showModal} = useContext(AlertContext)
        const {tempToken} = route.params

        const [loading, setLoading] = useState(false)
        const [focusedInput, setFocusedInput] = useState(null)
        const [password, setPassword] = useState("")
        const [showPassword, setShowPassword] = useState(false)

        const setNewPassword = async () => {
            try{

                setLoading(true)

                const response = await api.post("users/firstLogin", {
                    "newPassword": password
                }, {headers: {Authorization: `Bearer ${tempToken}`}})

                showModal(response.data.message, "success")
                navigation.navigate("Login")

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
                <ScrollView contentContainerStyle = {styles.generalView}>
                   
                   <LinearGradient style={styles.brandView} colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}}>
                        <Text 
                        style={styles.hostech}
                        onPress={() => navigation.navigate("Landing")}
                        >HOSTECH</Text>
                        <Text style={styles.welcome}>Reestablezca su Contraseña</Text>
                    </LinearGradient>

                    <View style = {styles.listView}>
                        <View style = {[styles.passwordView, focusedInput === "password" && styles.passwordViewFocused]}>
                            <TextInput 
                                placeholder="New Password"
                                value={password} 
                                secureTextEntry={!showPassword ? true : false}
                                onFocus={() => setFocusedInput("password")}
                                onBlur={() => setFocusedInput(null)}
                                style = {styles.passwordInput}  
                                onChangeText={ text => setPassword(text)}>
                            </TextInput>
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name = {showPassword ? "eye-off" : "eye"} size={22} color = "#666"/>
                            </TouchableOpacity>
                        </View>

                        <Button
                        backgroundColor={colorPalette.azulOscuro}
                        width={320}
                        height={60}
                        borderColor={colorPalette.azulOscuro}
                        text={ loading ? <ActivityIndicator size="small" color={colorPalette.blanco}/> : "Reestablecer contraseña"}
                        colorText={colorPalette.blanco}
                        fontSize={20}
                        disabled={loading}
                        action={() => setNewPassword()}
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

    inputFocused:{
        borderWidth:2,
        borderColor:colorPalette.azulOscuro

    },

    passwordView: {
        flexDirection:"row",
        alignItems: "center",
        justifyContent:"space-around",
        borderWidth:2,
        paddingRight:15,
        paddingLeft:10,
        borderRadius:10,
        height:50,
        borderColor:colorPalette.gris_transparente,
        width:320,
    },
    passwordInput:{
        flex:1,
        height:"100%",
        fontFamily:"OutfitRegular",
        fontSize:16,
        
    },
    passwordViewFocused:{
        borderWidth:2,
        borderColor:colorPalette.azulOscuro
    },

    listView:{
        flex:1,
        gap:30,
        marginTop:40
        
    },

    reset:{
        fontFamily:"OutfitBold",
        fontSize:20,
        color:colorPalette.azulOscuro
    }

})