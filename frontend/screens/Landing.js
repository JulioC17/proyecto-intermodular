import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import colorPalette from "../constant/colorPalette"
import { FONTS, SIZES } from "../constant/typography";
import { useNavigation } from "@react-navigation/native";
import { testConection } from "../services/testConection";
import { useEffect } from "react";

export default function Landing() {
  const navigation = useNavigation()
useEffect(() => {
  testConection()
},[])

  return (
    <View style={styles.container}>

      <Image
        source={require("../assets/logoHT.png")}
        style={styles.logo}
      />

      <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate("Register") }>
        <Text style={styles.btnTextRegister}>Regístrate</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.btnTextLogin}>Login</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        padding: 30,
        backgroundColor: colorPalette.blanco,
        alignItems:"center",
        justifyContent: "center"
    },
    
    logo:{
        resizeMode: "contain",
        height:300,
        width:300
    },

    btnTextRegister: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.large,
        color: colorPalette.blanco,
        fontWeight:"bold"
        
    },
    btnTextLogin: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.large,
        color: colorPalette.blanco,
        fontWeight:"bold"
        
    },
    registerBtn:{
      width:250,
      borderWidth:2,
      borderColor:colorPalette.azulOscuro,
      padding:10,
      borderRadius:8,
      backgroundColor:colorPalette.azulClaro,
      shadowColor:"#000",
      shadowOpacity:0.6,
      shadowOffset:{width: 0, height: 2},
      elevation:5,
      zIndex:1000,
      justifyContent:"center",
      alignItems:"center",
      margin:5
    },
    loginBtn:{
      width:250,
      borderWidth:2,
      borderColor:colorPalette.rojo,
      padding:10,
      borderRadius:8,
      backgroundColor:colorPalette.naranjaClaro,
      shadowColor:"#000",
      shadowOpacity:0.6,
      shadowOffset:{width: 0, height: 2},
      elevation:5,
      zIndex:1000,
      justifyContent:"center",
      alignItems:"center",
      margin:5

    }


})