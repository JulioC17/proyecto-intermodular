import React, {useContext, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import {Ionicons} from "@expo/vector-icons"
import Button from "../components/Button";
import { AuthContext } from "../context/AuthProvider";

export default function DashboardCards({icono, section, description, action, ChangMode}){
    return(
        
            <TouchableOpacity 
            style = {[styles.card, ChangMode && styles.darkCaard]}
            onPress={action}
            >
                <View style = {[styles.iconView, ChangMode && styles.darkCaard]}></View>
                    <Ionicons 
                    name = {icono}
                    size={36} 
                    color = { ChangMode ? colorPalette.blanco: colorPalette.azulOscuro} 
                    backgroundColor = {ChangMode ? colorPalette.azulOscuro : colorPalette.azulClaroTrasnparente} 
                    padding = {10}
                    borderRadius= {15}
                    marginRight = {20}
                    />
                <View style = {styles.descriptionView}>
                    <Text style = {styles.sectionText}>{ChangMode ? "Desfichar":section}</Text>
                    <Text style = {styles.descriptionSectionText}>{ChangMode ? "trabajando...":description}</Text>
                </View>
            </TouchableOpacity>
        
    )
}
const styles = StyleSheet.create({
    card:{
        flexDirection:"row",
        alignItems:"center",
        borderWidth:1,
        width:350,
        borderRadius:10,
        padding:15,
        borderColor:colorPalette.gris_transparente,
        margin:10
    },
    

    sectionText:{
        fontFamily:"OutfitBold",
        fontSize:20,
    },

    descriptionSectionText:{
        fontFamily:"OutfitRegular",
        fontSize:18,
        color:colorPalette.gris
    },

    darkCaard:{
        backgroundColor:colorPalette.azulClaroTrasnparente,
        borderColor:colorPalette.azulOscuro
    }
     
})