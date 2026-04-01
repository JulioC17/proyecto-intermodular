import React, {useState, useContext} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, ActivityIndicator } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import { FONTS, SIZES } from "../constant/typography";
import { api } from "../services/api";
import {Ionicons} from "@expo/vector-icons"
import { AlertContext } from "../context/AlertProvider";
import { AuthContext } from "../context/AuthProvider";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../components/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddCompany (){
    const navigation = useNavigation()
    const route = useRoute()
    const {showModal} = useContext(AlertContext)
    const {setVerifyEmail} = useContext(AuthContext)
    const baseUser = route.params?.usuario
    
    const [company, setCompany] = useState("")
    const [companyEmail, setCompanyEmail] = useState("")
    const [loading, setLoading] = useState(false)

    const [focusedInput, setFocusedInput] = useState(null)

    const handleRegister = async () => {

        if(!company){
            return showModal("El nombre de la empresa es obligatorio", "error")
        }
        
        try{

            setLoading(true)
            
            const response = await api.post("/auth/register", {
                usuario: baseUser,
                empresa:{
                    nombre:company,
                    email:companyEmail
                }
            })
            
            showModal(response.data.message, "success")
            setVerifyEmail(baseUser.email)
            await AsyncStorage.setItem("pendingEmail", baseUser.email)
            navigation.navigate("Verify")
            
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

                    <LinearGradient style={styles.brandView} colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}}>
                        <Text 
                        style={styles.hostech}
                        onPress={() => navigation.navigate("Landing")}
                        >HOSTECH</Text>
                        <Text style={styles.createAcount}>...ahora crea tu Primera empresa</Text>
                    </LinearGradient>

                    <View style = {styles.formView}>
                        <TextInput 
                            placeholder="Empresa" 
                            value={company}
                            onFocus={() => setFocusedInput("company")}
                            onBlur={() => setFocusedInput(null)}
                            style = {[
                                styles.input,
                                focusedInput === "company" && styles.inputFocused    
                            ]} 
                            onChangeText={ text => setCompany(text)}>
                        </TextInput>
                        
                        
                        
                        <TextInput 
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={companyEmail} 
                            onFocus={() => setFocusedInput("email")}
                            onBlur={() => setFocusedInput(null)}
                            style = {[
                                styles.input,
                                focusedInput === "email" && styles.inputFocused    
                            ]}  
                            onChangeText={ text => setCompanyEmail(text)}>
                        </TextInput>

                         <Button
                        text={
                            loading ? <ActivityIndicator color = "#fff"/> : <Text>Registrarme</Text>
                        }
                        backgroundColor={colorPalette.azulOscuro}
                        width={320}
                        height={60}
                        colorText={colorPalette.blanco}
                        fontSize={20}
                        disabled={loading}
                        action={() => handleRegister()}
                        />
                    <Text style={styles.inicio}>Ya tengo una cuenta.
                        <Text style={styles.loginText}
                        onPress={() => navigation.navigate("Login")}
                        > Login</Text>
                    </Text>

                    <Text 
                    style={styles.back}
                    onPress={() => navigation.goBack()}
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
        marginTop:70,        
        alignItems:"center",
        flex:1
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

    inicio:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },
    loginText:{
         fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.azulOscuro
    },
    back:{
         fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro,
    },
    

})