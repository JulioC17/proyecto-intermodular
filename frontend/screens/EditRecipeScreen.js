import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation, useRoute } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import {Ionicons} from "@expo/vector-icons"
import { AuthContext } from "../context/AuthProvider";
import DashboardWorker from "../components/DashboardWorker";
import Button from "../components/Button";

export default function EditRecipe(){
    const {user, token} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const route = useRoute() 
    const baseRecipe = route.params?.receta

    const navigation = useNavigation()
    const [nombre, setNombre] = useState("")
    const [ingredientes, setIngredientes] = useState("")
    const [elaboracion, setElaboracion] = useState("")
    const [montaje, setMontaje] = useState("")
    const [inputFocused, setInputFocused] = useState("")
    const [loading, setLoading] = useState(false)

   useEffect(() => {
        setNombre(baseRecipe.nombre)
        setIngredientes(baseRecipe.ingredientes),
        setElaboracion(baseRecipe.elaboracion),
        setMontaje(baseRecipe.montaje || "")
   }, [])

   const editRecipe = async () => {
    
    try{

        setLoading(true)

        const response = await api.put(`recetas/updateRecipe/${Number(user.empresa_id)}/${baseRecipe.id}`,{
            "nombre":nombre,
            "ingredientes": ingredientes,
            "elaboracion": elaboracion,
            "montaje": montaje
        }, {
            headers : {Authorization : `Bearer ${token}`}
        })

        showModal(response.data.message, "success")
        navigation.goBack()

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

                             <LinearGradient 
                                style={styles.brandView} 
                                colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} 
                                start = {{x:0, y:0}} 
                                end = {{x:1, y:0}}>

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
                        <Text style={styles.hostech}>{user.empresa}</Text>
                        <Text style={styles.welcome}>Editar Receta</Text>
                    </View>
                </LinearGradient>

                <View style = {styles.inputsViewGeneral}>

                    <View style = {styles.inputView}>
                        <Text style = {styles.title}>Nombre</Text>
                        <TextInput
                        style = {[styles.input, inputFocused === "nombre" && styles.inputFocused]}
                        value = {nombre}
                        onChangeText={(text) => setNombre(text)}
                        multiline
                        numberOfLines={2}
                        onFocus={() => setInputFocused("nombre")}
                        />
                    </View>

                    <View style = {styles.inputView}>
                        <Text style = {styles.title}>Ingredientes</Text>
                        <TextInput
                         style = {[styles.input, inputFocused === "ingredientes" && styles.inputFocused]}
                        value = {ingredientes}
                        onChangeText={(text) => setIngredientes(text)}
                        multiline
                        numberOfLines={6}
                        onFocus={() => setInputFocused("ingredientes")}
                        />
                    </View>

                    <View style = {styles.inputView}>
                        <Text style = {styles.title}>Elaboración</Text>
                        <TextInput
                        style = {[styles.input, inputFocused === "elaboracion" && styles.inputFocused]}
                        value = {elaboracion}
                        onChangeText={(text) => setElaboracion(text)}
                        multiline
                        numberOfLines={10}
                        onFocus={() => setInputFocused("elaboracion")}
                        />
                    </View>

                    <View style = {styles.inputView}>
                        <Text style = {styles.title}>Montaje</Text>
                        <TextInput
                        style = {[styles.input, inputFocused === "montaje" && styles.inputFocused]}
                        value = {montaje}
                        onChangeText={(text) => setMontaje(text)}
                        multiline
                        numberOfLines={10}
                        onFocus={() => setInputFocused("montaje")}
                        />
                    </View>

                    { nombre && ingredientes && elaboracion && 
                    <View style ={styles.btnSave}>
                        <Button
                            backgroundColor={colorPalette.azulOscuro}
                            width={320}
                            height={60}
                            text={loading ? 
                                <ActivityIndicator color="#fff" size="small"/> : "Guardar Receta"
                            }
                            colorText={colorPalette.blanco}
                            fontSize={20}
                            action={() => editRecipe()}

                        />
                    </View>
                    }
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
        justifyContent:"space-around",
        alignItems:"center",
        height:120,
        flexDirection:"row",
        gap:30
    },

    titleAndSection:{
        justifyContent:"center",
        alignItems:"center"
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
    inputsViewGeneral:{
        flex:4,
        justifyContent:"flex-start",
        alignItems:"center"
    },
    inputView:{
        justifyContent:"flex-start",
        alignItems:"flex-start",
        margin:15
    
    },
    title:{
        fontFamily:"OutfitBold",
        fontSize:20,
    },
    input:{
        borderWidth:1,
        width:340,
        borderRadius:10,
        fontSize:18,
        borderColor:colorPalette.gris
    },
    inputFocused:{
        borderWidth:1,
        width:340,
        borderRadius:10,
        fontSize:18,
        borderColor:colorPalette.azulOscuro
    },
    btnView:{
         position:"absolute",
        left:20
    },
    btnSave:{
        margin:20
    }


})