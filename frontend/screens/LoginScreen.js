import React, {useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { CurrentRenderContext, useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import { FONTS, SIZES } from "../constant/typography";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import {ErrorModal, SuccesModal} from "../components/ResModal";


export default function Login (){
    return(
        <SafeAreaView style = {{flex:1}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff"}}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>
                    <Image source={require("../assets/nombreLogo.png")} style = {styles.imagenLogo}/>

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
    }
})