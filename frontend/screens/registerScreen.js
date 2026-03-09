import React, {useState, useContext} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import { FONTS, SIZES } from "../constant/typography";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import {Ionicons} from "@expo/vector-icons"
import { AlertContext } from "../context/AlertProvider";

export default function RegisterScreen (){
    const navigation = useNavigation()
    const {showModal} = useContext(AlertContext)
    
    const [loading, setLoading] = useState(false)
    const [nombre, setNombre] = useState("")
    const [apellidos, setApellidos]= useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [dni, setDni] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const [focusedInput, setFocusedInput] = useState(null)

    const handleRegister = async (nombre, apellidos, email, password, dni) => {
        
        try{

            setLoading(true)
            
            const response = await api.post("/auth/register", {
                "nombre": nombre,
                "apellidos": apellidos,
                "email":email,
                "password": password,
                "dni":dni
            })
            
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
        
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff" }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>

                    <Image source={require("../assets/nombreLogo.png")} style = {styles.imagenLogo}/>

                    <View style = {styles.formView}>
                        <TextInput 
                            placeholder="Nombre" 
                            value={nombre}
                            onFocus={() => setFocusedInput("nombre")}
                            onBlur={() => setFocusedInput(null)}
                            style = {[
                                styles.input,
                                focusedInput === "nombre" && styles.inputFocused    
                            ]} 
                            onChangeText={ text => setNombre(text)}>
                        </TextInput>
                        
                        <TextInput 
                            placeholder="Apellidos" 
                            value={apellidos}
                            onFocus={() => setFocusedInput("apellidos")}
                            onBlur={() => setFocusedInput(null)}
                            style = {[
                                styles.input,
                                focusedInput === "apellidos" && styles.inputFocused    
                            ]} 
                            onChangeText={ text => setApellidos(text)}>
                        </TextInput>
                        
                        <TextInput 
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
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
                        
                        <TextInput 
                            placeholder="DNI" 
                            value={dni}
                            onFocus={() => setFocusedInput("dni")}
                            onBlur={() => setFocusedInput(null)}
                            style = {[
                                styles.input,
                                focusedInput === "dni" && styles.inputFocused    
                            ]}  
                            onChangeText={ text => setDni(text)}>
                        </TextInput>

                    </View>

                    
                    <TouchableOpacity 
                    style = {styles.registerBtn} 
                    onPress={() => handleRegister(nombre, apellidos, email, password, dni)}
                    disabled = {loading}
                    >
                        {loading ? <ActivityIndicator color = "#fff"/> : <Text style={styles.registerBtnText}>Registrarme</Text>}
                    </TouchableOpacity>
                    

                    <Text style ={styles.firstWords}>
                        Ya tengo una cuenta.{" "}
                            <Text onPress={() => navigation.navigate("Login")} style = {styles.link}>Ir a Login</Text>
                    </Text>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
        
    )
}

const styles = StyleSheet.create({
    generalView: {
        justifyContent:"center",
        alignItems: "center",
        marginBottom:40
    },

    imagenLogo:{
        resizeMode:"contain",
        width:250
    },

    formView:{
        gap:20,
        margin:20
    },

    input:{
        borderWidth:1,
        width:250,
        borderRadius:5,
        //borderColor: colorPalette.gris,
        fontFamily: FONTS.regular,
        fontSize: SIZES.medium
    },

    registerBtn:{
       width:150,
      borderWidth:2,
      borderColor:colorPalette.azulOscuro,
      padding:10,
      borderRadius:8,
      backgroundColor:colorPalette.azulClaro,
      shadowColor:"#000",
      shadowOpacity:0.6,
      shadowOffset:{width: 0, height: 2},
      elevation:5,
      zIndex:1000,
      justifyContent:"center",
      alignItems:"center",
      margin:5
    },

    disabledBtn:{
        opacity:0.6
    },

    registerBtnText:{
        fontFamily:FONTS.bold,
        fontSize:SIZES.large,
        color:"#ffffff",
        fontWeight: "bold"
    },

    firstWords:{
        fontFamily: FONTS.regular,
        fontSize: SIZES.large,
        margin:10

    },

    link:{
        fontFamily:FONTS.regular,
        fontSize:SIZES.large,
        color: colorPalette.naranjaClaro,
        fontWeight:"bold"
    },

    inputFocused:{
        borderWidth:1,
        borderColor:colorPalette.naranjaClaro

    },

    passwordView: {
        flexDirection:"row",
        alignItems: "center",
        justifyContent:"space-between",
        borderWidth:1,
        borderRadius:5,
        //borderColor: colorPalette.gris,
        paddingRight:5
    },
    passwordInput:{
        flex:1,
        height:"100%"
    },
    passwordViewFocused:{
        borderWidth:1,
        borderColor:colorPalette.naranjaClaro
    }

})