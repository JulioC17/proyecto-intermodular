import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import Button from "./Button";
import { AuthContext } from "../context/AuthProvider";
import DashboardCards from "./DashboardCards";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardAdmins({estado}){
    const navigation = useNavigation()
    const {user} = useContext(AuthContext)

    return(
        <>

                    {user.rol !== "propietario" && (
                        <DashboardCards
                    icono = "time-outline"
                    section= "Fichar"
                    description="Entrada/Salida"
                    action={() => navigation.navigate("Timer")}
                    ChangMode={estado}
                    />)}
                    
                    <DashboardCards
                    icono = "calendar-outline"
                    section= "Turnos"
                    description="Horarios y Asignaciones"
                    action={() => navigation.navigate("Turnos")}
                    />
        
                    <DashboardCards
                    icono = "airplane-outline"
                    section= "Vacaciones"
                    description="Solicitudes y Estados"
                    action={() => navigation.navigate("Vacaciones")}
                    />
        
                    <DashboardCards
                    icono = "book-outline"
                    section= "Recetas"
                    description="Recetario del Restaurante"
                    action={() => navigation.navigate("Recipes")}
                    />

                    <DashboardCards
                    icono = "stats-chart-outline"
                    section= "Mis horas trabajadas"
                    description="Filtra y revisa tu histórico"
                    action={() => navigation.navigate("Resumen")}
                    />   

                    <DashboardCards
                    icono = "clipboard-outline"
                    section= "Control de Jornada"
                    description="Datos del Día"
                    action={() => navigation.navigate("Recipes")}
                    />

                    <DashboardCards
                    icono = "people-outline"
                    section= "Trabajadores"
                    description="Control de trabajadores"
                    action={() => navigation.navigate("AddWorkers")}
                    />
        
                </>
    )
}