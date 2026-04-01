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


export default function EditUser({route}){
        const {user, token} = useContext(AuthContext)
        const {showModal} = useContext(AlertContext)
        const navigation = useNavigation()
        const {nombre, apellidos, email, telefono, dni, sueldo, id, rol, empresa} = route.params.userDescription
        const [changedEmail, setCHangedEmail] = useState(null)
        const [changedPhone, setChangedPhone] = useState(null)
        const [changedCompany, setChangedCompany] = useState(null)
        const [changedRol, setChangedRol] = useState(null)
        const [changedSalary, setChangedSalary] = useState(null)
        const [modalVisible, setModalVisible] = useState(false)
    
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
                        <Text style={styles.welcome}>Editar Empleado</Text>
                    </View>
                    </LinearGradient>

                    <View style ={styles.listView}>
                        
                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>DATOS DE LA CUENTA</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Nombre:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{nombre} {apellidos}</Text>
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Email:</Text>
                                    <TextInput
                                    value={changedEmail}
                                    placeholder={email}
                                    onChangeText={(text) => setCHangedEmail(text)}
                                    style = {styles.inputs}
                                    ></TextInput>
                                </View>
                            </View>
                        </View>

                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>INFORMACIÓN PERSONAL</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>DNI / NIE:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{dni}</Text>
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Teléfono:</Text>
                                    <TextInput
                                    value={changedPhone}
                                    placeholder={telefono ? telefono : "No registrado"}
                                    onChangeText={(text) => setChangedPhone(text)}
                                    style = {styles.inputs}
                                    ></TextInput>
                                </View>
                            </View>
                        </View>

                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>CONTRATO Y EMPRESA</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Empresa:</Text>
                                    { user.rol !== "propietario" ? <Text style = {styles.infoCardsContentTextDescription}>{empresa}</Text> :
                                        <TouchableOpacity
                                        onPress={() => setModalVisible(true)}
                                        >
                                            <Text>{empresa}</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Rol:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{rol}</Text>
                                </View>
                        
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Sueldo:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{sueldo ? `${sueldo} €`  : "No disponible"}</Text>
                                </View>
                            </View>
                        </View>

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
        marginBottom:40,
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
        flex:1,
        marginTop:20,
        gap:20,
        alignItems:"center"
    },

    infoCards:{
        width:320,
        justifyContent:"center",
        gap:10,
        margin:10
        
    },

    infoCardsContentView:{
        borderRadius:10,
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:15,
        gap:20
    },
    infoCardsTitle:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro
    },

    infoCardsContent:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
    },

    infoCardsContentTextTitle:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    infoCardsContentTextDescription:{
        fontFamily:"OutfitBold",
        fontSize:16,
    },

    inputs: {
        fontFamily:"OutfitRegular",
        fontSize:16,
        color:colorPalette.azulOscuro
    }
})