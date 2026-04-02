import React, {useCallback, useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, FlatList, Alert, Modal} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import {Ionicons} from "@expo/vector-icons"
import Button from "../components/Button";
import { AuthContext } from "../context/AuthProvider";
import DashboardWorker from "../components/DashboardWorker";
import DashboardAdmins from "../components/DashboardAdmins";
import DateTimePicker from "@react-native-community/datetimepicker"
import {Picker, picker} from "@react-native-picker/picker"

export default function RegisterNewWorker(){
    const {user, token, activeCompany} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()

        const [loading, setLoading] = useState(false)
        const [nombre, setNombre] = useState("")
        const [apellidos, setApellidos]= useState("")
        const [email, setEmail] = useState("")
        const [telefono, setTelefono] = useState("")
        const [sueldo, setSueldo] = useState("")
        const [dni, setDni] = useState("")
        const [focused, setFocused] = useState(null)

        const registerWorker = async() => {
            try{

                setLoading(true)

                const response = await api.post("/users/createUser", {
                    "nombre": nombre,
                    "apellidos": apellidos,
                    "email": email,
                    "telefono": telefono,
                    "dni": dni,
                    "sueldo":sueldo,
                    "id_empresa": activeCompany.id
                },{headers: {Authorization: `Bearer ${token}`}})

                showModal(response.data.message, "success")
                navigation.goBack()
            
            }catch(error){
            const data = error.response?.data
            if(data?.errors){
                showModal(data.errors.join("\n"), "error" )
                        
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
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
                        <Text style={styles.welcome}>Nuevo Trabajador</Text>
                    </View>
                    </LinearGradient>
                    <View style = {styles.listView}>

                        <TextInput
                        placeholder="Nombre"
                        value={nombre}
                        style = {[styles.input, focused === "Nombre" && styles.focused]}
                        onFocus={()=> setFocused("Nombre")}
                        onBlur={() => setFocused(null)}
                        onChangeText={(text) => setNombre(text)}
                        ></TextInput>
                        
                        <TextInput
                        placeholder="Apellidos"
                        value={apellidos}
                        style = {[styles.input, focused === "Apellidos" && styles.focused]}
                        onFocus={()=> setFocused("Apellidos")}
                        onBlur={() => setFocused(null)}
                        onChangeText={(text) => setApellidos(text)}
                        ></TextInput>
                        
                        <TextInput
                        placeholder="Email"
                        value={email}
                        style = {[styles.input, focused === "Email" && styles.focused]}
                        onFocus={()=> setFocused("Email")}
                        onBlur={() => setFocused(null)}
                        onChangeText={(text) => setEmail(text)}
                        ></TextInput>
                        
                        <TextInput
                        placeholder="Teléfono"
                        value={telefono}
                        style = {[styles.input, focused === "Telefono" && styles.focused]}
                        onFocus={()=> setFocused("Telefono")}
                        onBlur={() => setFocused(null)}
                        onChangeText={(text) => setTelefono(text)}
                        ></TextInput>
                        
                        <TextInput
                        placeholder="DNI"
                        value={dni}
                        style = {[styles.input, focused === "DNI" && styles.focused]}
                        onFocus={()=> setFocused("DNI")}
                        onBlur={() => setFocused(null)}
                        onChangeText={(text) => setDni(text)}
                        ></TextInput>
                        
                        <TextInput
                        placeholder="Sueldo"
                        value={sueldo}
                        style = {[styles.input, focused === "Sueldo" && styles.focused]}
                        onFocus={()=> setFocused("Sueldo")}
                        onBlur={() => setFocused(null)}
                        onChangeText={(text) => setSueldo(text)}
                        ></TextInput>

                        <Button
                        backgroundColor={colorPalette.azulOscuro}
                        width={320}
                        height={60}
                        borderColor={colorPalette.azulOscuro}
                        text={loading ? <ActivityIndicator color={colorPalette.blanco} size="small"/> : "Dar de Alta"}
                        colorText={colorPalette.blanco}
                        fontSize={20}
                        disabled={loading}
                        action={() => registerWorker()}
                        />
                        
                    </View>
                    </ScrollView>
                    </KeyboardAvoidingView>
                    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    generalView: {
        flexGrow:1,
        justifyContent:"space-between",
        alignItems: "center",
        paddingBottom:40,
    },

    brandView:{
        width:"100%",
        justifyContent:"space-around",
        alignItems:"center",
        height:120,
        flexDirection:"row",
        gap:30
    },
    
    hostech:{
        fontSize:28,
        fontFamily:"OutfitExtraBold",
        color:colorPalette.blanco
    },

    titleAndSection:{
        justifyContent:"center",
        alignItems:"center"
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

    listView:{
        gap:35,       
        alignItems:"center",
        margin:50
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

    focused:{
        borderWidth:2,
        borderColor:colorPalette.azulOscuro
    }
})