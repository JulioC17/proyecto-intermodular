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
        <Text style={styles.btnTextRegister}>Regístrate ahora</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn}>
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
        color: colorPalette.naranjaClaro
        
    },
    btnTextLogin: {
        fontFamily: FONTS.regular,
        fontSize: SIZES.large,
        color: colorPalette.azulOscuro
        
    }


})