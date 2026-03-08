import React, {useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { CurrentRenderContext, useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import { FONTS, SIZES } from "../constant/typography";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import {ErrorModal, SuccesModal} from "../components/ResModal";

export default function RegisterScreen (){
    const navigation = useNavigation()
    const [nombre, setNombre] = useState("")
    const [apellidos, setApellidos]= useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [dni, setDni] = useState("")

    const [errorMessage, setErrorMessage] = useState("")
    const [succesMessage, setSuccesMessage] = useState("")
    const [modalErrorVisible, setModalErrorVisible] = useState(false)
    const [modalSuccessVisible, setModalSuccessVisible] = useState(false)

    const handleRegister = async (nombre, apellidos, email, password, dni) => {
        try{
            
            const response = await api.post("/auth/register", {
                "nombre": nombre,
                "apellidos": apellidos,
                "email":email,
                "password": password,
                "dni":dni
            })
            
            setSuccesMessage(response.data.message)
            setModalSuccessVisible(true)
            
        }catch(error){
            
            const data = error.response?.data
            if(data?.errors){
                setErrorMessage(data.errors.join("\n"))
                
            }else if(data?.error){
                setErrorMessage(data.error)
                
            }else{
                setErrorMessage("Error interno del servidor")
            }

            setModalErrorVisible(true)
        }
    }

    return(
        
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>

                    <Image source={require("../assets/nombreLogo.png")} style = {styles.imagenLogo}/>

                    <View style = {styles.formView}>
                        <TextInput 
                            placeholder="Nombre" 
                            value={nombre}
                            style = {styles.input} 
                            onChangeText={ text => setNombre(text)}>
                        </TextInput>
                        
                        <TextInput 
                            placeholder="Apellidos" 
                            value={apellidos}
                            style = {styles.input} 
                            onChangeText={ text => setApellidos(text)}>
                        </TextInput>
                        
                        <TextInput 
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email} 
                            style = {styles.input} 
                            onChangeText={ text => setEmail(text)}>
                        </TextInput>
                        
                        <TextInput 
                            placeholder="Password"
                            value={password} 
                            secureTextEntry={true}
                            style = {styles.input} 
                            onChangeText={ text => setPassword(text)}>
                        </TextInput>
                        
                        <TextInput 
                            placeholder="DNI" 
                            value={dni}
                            style = {styles.input} 
                            onChangeText={ text => setDni(text)}>
                        </TextInput>

                    </View>

                    <LinearGradient colors={[colorPalette.azulClaro, colorPalette.azulOscuro]} start = {{x:0, y:0}} end = {{x:0, y:1}} style = {styles.gradiente}>
                    <TouchableOpacity style = {styles.registerBtn} onPress={() => handleRegister(nombre, apellidos, email, password, dni)}>
                        <Text style= {styles.registerBtnText}>Registrame</Text>
                    </TouchableOpacity>
                    </LinearGradient>

                    <Text style ={styles.firstWords}>
                        Ya tengo una cuenta?{" "}
                            <Text onPress={() => navigation.navigate("Login")} style = {styles.link}>Ir a Login</Text>
                    </Text>

                    <ErrorModal
                        visible={modalErrorVisible}
                        message={errorMessage}
                        onClose={() => setModalErrorVisible(false)}
                    />

                    <SuccesModal
                        visible={modalSuccessVisible}
                        message={succesMessage}
                        onClose={() => setModalSuccessVisible(false)}
                    />

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
        gap:10,
        margin:20
    },

    input:{
        borderWidth:1,
        width:250,
        borderRadius:5,
        borderColor: colorPalette.gris,
        fontFamily: FONTS.regular,
        fontSize: SIZES.medium
    },

    registerBtn:{
       padding:5,
       margin:5,
    },

    gradiente:{
        borderWidth:1,
        borderColor:colorPalette.azulOscuro,
        borderRadius:8,
    },


    registerBtnText:{
        fontFamily:FONTS.bold,
        fontSize:SIZES.medium,
        color:"#ffffff"
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
    }



   
    
})