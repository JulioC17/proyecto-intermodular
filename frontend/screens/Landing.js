import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import colorPalette from "../constant/colorPalette"

export default function Landing() {
  return (
    <View style={styles.container}>

      <Image
        source={require("../assets/logoHT.png")}
        style={styles.logo}
      />

      <TouchableOpacity style={styles.registerBtn}>
        <Text style={styles.btnText}>Regístrate ahora</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginBtn}>
        <Text style={styles.btnText}>Login</Text>
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
    }

})