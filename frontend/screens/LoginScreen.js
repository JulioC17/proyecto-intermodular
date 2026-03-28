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


export default function Login (){
    const navigation = useNavigation()
    const {showModal} = useContext(AlertContext)
    const {login} = useContext(AuthContext)

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [focusedInput, setFocusedInput] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleLogin = async (email, password) => {

        try {
            setLoading(true)

            const response = await api.post("/auth/login", {
               "email": email,
               "password": password
            })

            if(response.data.tempToken){
                showModal(response.data.message, "success")
                navigation.navigate("FirstLogin", {
                    tempToken: response.data.tempToken
                    
                })
               console.log("hola")
                return
            }
            
            
            await login(response.data.token)
            showModal(response.data.message, "success")
            navigation.navigate("Dashboard")



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
                        <Text 
                        style={styles.hostech}
                        onPress={() => navigation.navigate("Landing")}
                        >HOSTECH</Text>
                        <Text style={styles.welcome}>Bienvenido de nuevo</Text>
                    </LinearGradient>

                    <View style = {styles.formView}>
                        <TextInput 
                            placeholder="email" 
                            value={email}
                            onFocus={() => setFocusedInput("email")}
                            onBlur={() => setFocusedInput(null)}
                            style = {[
                            styles.input,
                            focusedInput === "email" && styles.inputFocused    
                                    ]} 
                            onChangeText={ text => setEmail(text)}>
                        </TextInput>

                     <View style = {[styles.passwordView, focusedInput === "password" && styles.passwordViewFocused]}>
                        <TextInput 
                            placeholder="Password"
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
                    text={
                        loading ? <ActivityIndicator color = "#fff"/> : <Text>Iniciar Sesión</Text>
                        }
                        backgroundColor={colorPalette.azulOscuro}
                        width={320}
                        height={60}
                        colorText={colorPalette.blanco}
                        fontSize={20}
                        disabled={loading}
                        action={() => handleLogin(email, password)}
                        />

                        <Text style={styles.inicio}>¿No tienes una cuenta?
                            <Text style={styles.registerText} onPress={() => navigation.navigate("Register")}> Regístrate</Text>
                        </Text>
                </View>
                
                <View style={styles.footerView}>
                        <Text style={styles.footer}>© 2026 HOSTECH Hospitality System </Text>
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
    formView:{
        gap:35,
        margin:10,        
        justifyContent:"flex-start",
        alignItems:"center",
        flex:1,
        marginTop:100
    },
    input:{
        borderWidth:2,
        width:320,
        padding:10,
        borderRadius:10,
        height:50,
        borderColor:colorPalette.gris_transparente,
        fontFamily:"OutfitRegular",
        fontSize:16,
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
    btnFooter:{
        justifyContent:"center",
        alignItems:"center",
        gap:20,
        flex:1
    },
     inicio:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },
    registerText:{
         fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.azulOscuro
    },
    footerView:{
      borderTopWidth:1,
      borderColor:colorPalette.gris_transparente,
      width:350,
      padding:5,
      
     },

     footer:{
      fontFamily:"OutfitBold",
      color:colorPalette.gris,
      textAlign:"center"
     }

    
})