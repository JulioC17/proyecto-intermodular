import React, {useContext, useEffect, useRef, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import { FONTS, SIZES } from "../constant/typography";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import { AuthContext } from "../context/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../components/Button";
import {Ionicons} from "@expo/vector-icons"


export default function VerifyEmail(){
    const navigation = useNavigation()
    const {verifyEmail} = useContext(AuthContext)
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [loading, setLoading] = useState(false)
    const {showModal} = useContext(AlertContext)
    const [focused, setFocused] = useState(null)

    const handleCode = async (email, code) =>{
        try{

            setLoading(true)
            const response = await api.post("/auth/verify-email", {
                "email":email,
                "verificationCode":code
            })

            showModal(response.data.message, "success")
            setCode(["", "", "", "", "", ""])
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

    const handleResenCode = async(email) => {

        try{

            setLoading(true)
            const response = await api.post("/auth/resend", {
                "email":email
            })

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

    const referencia = useRef([])
    
    const handleCodeArray = (text, index) =>{
        const newArray = [...code]
        newArray[index] = text
        setCode(newArray)

        if(text && index < 5){
            referencia.current[index + 1].focus()
        }else if(!text && index > 0){
            referencia.current[index-1].focus()
        }
    }

    
    
    return (
        <SafeAreaView style={{ flex: 1 }}>
           <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff" }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>
                    
                     <LinearGradient style={styles.brandView} colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}}>
                        <Text style={styles.hostech}>HOSTECH</Text>
                        <Text style={styles.createAcount}>Verificación de email</Text>
                    </LinearGradient>
                    
                    
                    <View style= {styles.formView}>
                    
                    <Text style = {styles.sentence}>Hemos enviado un código de verificación al email {verifyEmail}</Text>

                    <View style = {styles.inputsView}>
                        
                        {code.map((number, index) => (
                            
                            <TextInput
                            style = {[styles.input, focused === index && styles.inputFocused]}
                            ref={(ref) => referencia.current[index]=ref }
                            key ={index}
                            value = {number}
                            keyboardType="numeric"
                            maxLength={1}
                            onChangeText={(text) => {handleCodeArray(text, index)}}
                            onFocus={() => setFocused(index)}
                            onBlur={() => setFocused(null)}

                            />
                        ))}

                    </View>

                    <Button
                    backgroundColor={colorPalette.azulOscuro}
                    width={320}
                    height={60}
                    text={
                        loading ? <ActivityIndicator color = {colorPalette.blanco}/> : <Text>Aceptar</Text>
                    }
                    colorText={colorPalette.blanco}
                    fontSize={20}
                    action={() => handleCode(verifyEmail, code.join(""))}
                    />

                    <Text style={styles.noCode}>¿No has recibido el código?
                        <Text 
                        style={styles.resend}
                        onPress={() => handleResenCode(verifyEmail)}
                        > Reenviar Código</Text>
                    </Text>

                    <Text 
                    style={styles.back}
                    onPress={() => navigation.navigate("Register")}
                    >
                        <Ionicons name = "arrow-back" color={colorPalette.azulOscuro} size = {18}/>
                         Volver al registro
                    </Text>
                        </View>


                </ScrollView>
                
            </KeyboardAvoidingView> 
        </SafeAreaView>
        
    )
}

const styles = StyleSheet.create({
    generalView: {
        flex:1,
        justifyContent:"center",
        alignItems: "center",
        marginBottom:40
    },
    brandView:{
        height:120,
        width:"100%",
        justifyContent:"center",
        alignItems:"center"
    },
    formView:{
        gap:40,
        margin:40,
        flex:5,
        justifyContent:"start",
        alignItems:"center"
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
    inputsView:{
        flexDirection:"row",
        gap:10
    },
    input:{
        borderWidth:2,
        borderColor:colorPalette.gris_transparente,
        width:40,
        height:50,
        borderRadius:10,
        fontFamily:"OutfitRegular",
        fontSize:20,
        textAlign:"center"
    },
    sentence:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris,
        textAlign:"center"
    }, 
    
    noCode:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris,
        textAlign:"center"
    },

    resend:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro,
    },

    back:{
         fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro,
    },

    inputFocused:{
        borderWidth:2,
        borderColor: colorPalette.azulOscuro
    }

   
})