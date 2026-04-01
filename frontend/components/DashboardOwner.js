import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, FlatList} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import Button from "./Button";
import { AuthContext } from "../context/AuthProvider";
import DashboardCards from "./DashboardCards";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DashboardOwner({restaurants}){
    const navigation = useNavigation()
    const {setActiveCompany} = useContext(AuthContext)
    console.log(restaurants)
    return(
        <>
            
            {restaurants.map((item, index) => {
               return( 
                <DashboardCards
                    icono="restaurant-outline"
                    section={item.empresa}
                    description={ item.num_trabajadores == "1" ? `${item.num_trabajadores} trabajador` : `${item.num_trabajadores} trabajadores`}
                    action={() => {
                        setActiveCompany({id:item.id, empresa: item.empresa})
                    }}
                    key={item.id}
                />)
            })}
            
        </>
    )
}