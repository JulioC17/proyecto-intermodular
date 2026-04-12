import React, {useCallback, useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, FlatList, Alert, Modal} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
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

export default function WorkerMonthResumen(){
     const {user, token, activeCompany} = useContext(AuthContext)
        const {showModal} = useContext(AlertContext)
        const navigation = useNavigation()
        const route = useRoute()

        const baseUser = route.params?.usuario
    return(
        <SafeAreaView style = {{flex:1}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff"}}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style = {styles.generalView}>
                   
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
                        <Text style={styles.welcome}>{baseUser.nombre} {baseUser.apellidos}</Text>
                    </View>
                    </LinearGradient>
                    <ScrollView contentContainerStyle = {{paddingBottom:40, alignItems:"center"}}>
                    <View style= {styles.listView}>
                        {baseUser.desgloce.map((e, i) => (
                            <View style= {styles.desgloceCards} key={i}>
                                <Text style= {styles.desgloceDate}>{new Date(e.fecha).toLocaleDateString("es-ES", {
                                    month:"long",
                                    day:"2-digit",
                                    year:"numeric"
                                })}</Text>

                                <View style= {styles.desgloceTimes}>
                                    <Text style= {styles.desgloceIn}>Entrada: <Text style= {styles.desgloceInText}>{e.inicio.slice(0, 5)}</Text></Text>
                                    <Text style= {styles.desgloceOut}>Salida: <Text style= {styles.desgloceOutText}>{e.fin.slice(0, 5)}</Text></Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    </ScrollView>
                    </View>
                    </KeyboardAvoidingView>
                    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    generalView: {
        flex:1,
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
        flexGrow:1,
        padding:10,
        margin:10
    },

    desgloceCards:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        width:320,
        padding:10,
        gap:10,
        margin:10,
        borderRadius:10
    },

    desgloceTimes:{
        flexDirection:"row",
        justifyContent:"space-between"
    },

    desgloceDate:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.azulOscuro
    },

    desgloceIn:{
      fontFamily:"OutfitBold",
      fontSize:16,
    },

    desgloceInText:{
        fontFamily:"OutfitBold",
      fontSize:18,
      color:"#22c55e" 
    },

    desgloceOut:{
         fontFamily:"OutfitBold",
        fontSize:16,
    },

    desgloceOutText:{
        fontFamily:"OutfitBold",
         fontSize:18,
        color:"#ef0c0c"
    }
})