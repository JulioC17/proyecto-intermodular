import React, {useState, useContext, useEffect} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import { FONTS, SIZES } from "../constant/typography";
import { api } from "../services/api";
import {Ionicons} from "@expo/vector-icons"
import { AlertContext } from "../context/AlertProvider";
import { AuthContext } from "../context/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen (){
    const navigation = useNavigation()
    const {showModal} = useContext(AlertContext)
    const {setVerifyEmail} = useContext(AuthContext)
    
    const [loading, setLoading] = useState(false)
    const [nombre, setNombre] = useState("")
    const [apellidos, setApellidos]= useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [dni, setDni] = useState("")
    const [showPassword, setShowPassword] = useState(false)

    const [focusedInput, setFocusedInput] = useState(null)

    const goToCompanyScreen = () => {
        if(!nombre || !apellidos || !email || !password || !dni){
            showModal("Faltan campos por rellenar", "error")
            return
        }

        navigation.navigate("AddCompany", {
            usuario:{
                nombre: nombre,
                apellidos: apellidos,
                email: email,
                password: password,
                dni: dni
            }
        })
    }

   return(
        
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff" }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>

                    <LinearGradient style={styles.brandView} colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}}>
                        <Text 
                        style={styles.hostech}
                        onPress={() => navigation.navigate("Landing")}
                        >HOSTECH</Text>
                        <Text style={styles.createAcount}>Vamos a Conocernos...</Text>
                    </LinearGradient>

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

                <View style={styles.btnFooter}>
                    <Button
                        text={
                            loading ? <ActivityIndicator color = "#fff"/> : <Text>Siguiente</Text>
                        }
                        backgroundColor={colorPalette.azulOscuro}
                        width={320}
                        height={60}
                        colorText={colorPalette.blanco}
                        fontSize={20}
                        disabled={loading}
                        action={() => goToCompanyScreen()}
                        />
                    <Text style={styles.inicio}>Ya tengo una cuenta.
                        <Text style={styles.loginText}
                        onPress={() => navigation.navigate("Login")}
                        > Login</Text>
                    </Text>

                </View>

                    
                    

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
        
    )
}

const styles = StyleSheet.create({
    generalView: {
        flexGrow:1,
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

    createAcount:{
        fontSize:16,
        fontFamily:"OutfitRegular",
        color:colorPalette.blanco
    },
    formView:{
        gap:35,
        margin:20,        
        justifyContent:"center",
        alignItems:"center",
        flex:4
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

    disabledBtn:{
        opacity:0.6
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
    loginText:{
         fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.azulOscuro
    }
    

})

