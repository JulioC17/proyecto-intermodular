import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,FlatList, ScrollView} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { AuthContext } from "../context/AuthProvider";
import {Ionicons} from "@expo/vector-icons"

export default function RecipeDescription(){
    const navigation = useNavigation()
    const {recipe, setRecipe} = useContext(AuthContext)
    return(
        <SafeAreaView style = {{flex:1}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff"}}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>

                     <TouchableOpacity 
                        style={styles.btnView}
                        onPress={() => {
                        setRecipe(null)
                        navigation.goBack()}}
                    >
                        <Ionicons 
                            name = "arrow-back"
                            size= {26}
                            color = {colorPalette.blanco}
                        />
                    </TouchableOpacity>
                   
                   <LinearGradient style={styles.brandView} colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}}>
                        <Text 
                        style={styles.hostech}
                        >HOSTECH</Text>
                        <Text style={styles.welcome}>{recipe.nombre}</Text>
                    </LinearGradient>
                    
                    <View style = {styles.description}>
                        <View style = {styles.section}>
                            <Text style={styles.title}>Nombre</Text>
                            <Text style={styles.p}>{recipe.nombre}</Text>
                        </View>

                        <View style = {styles.section}>
                            <Text style={styles.title}>Ingredientes</Text>
                            <Text style={styles.p}>{recipe.ingredientes}</Text>
                        </View>
                        
                        <View style = {styles.section}>
                            <Text style={styles.title}>Elaboración</Text>
                            <Text style={styles.p}>{recipe.elaboracion}</Text>
                        </View>

                        <View style = {styles.section}>
                            <Text style={styles.title}>Montaje</Text>
                            <Text style={styles.p}>{recipe.montaje || "No hay momntaje definido"}</Text>
                        </View>

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
        justifyContent:"center",
        alignItems:"center",
        height:120,

    },

    hostech:{
        fontSize:28,
        fontFamily:"OutfitExtraBold",
        color:colorPalette.blanco
    },

    welcome:{
        fontSize:18,
        fontFamily:"OutfitRegular",
        color:colorPalette.blanco, 
        textAlign:"center"
    },

    btnView:{
        position:"absolute",
        width:45,
        height:30,
        top:30,
        left:20,
        zIndex:999
    },

    back:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.blanco,
        textDecorationLine:"underline"
    },

    section:{
        padding:10,
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        margin:10,
        borderRadius:10
    },

    description:{
        flex:3,
        margin:15,
        width:350
    },
    title:{
        fontFamily:"OutfitBold",
        fontSize:20,
        color:colorPalette.negro,
    },

    p:{
        fontFamily:"OutfitRegular",
        fontSize:18,
    }
})