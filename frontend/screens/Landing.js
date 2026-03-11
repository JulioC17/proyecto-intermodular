import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import colorPalette from "../constant/colorPalette"
import { FONTS, SIZES } from "../constant/typography";
import { useNavigation } from "@react-navigation/native";
import { testConection } from "../services/testConection";
import { useEffect } from "react";
import {LinearGradient} from "expo-linear-gradient"
import Curva from "../components/curva";
import Button from "../components/Button";

export default function Landing() {
  const navigation = useNavigation()
useEffect(() => {
  testConection()
},[])

  return (
    <View style={styles.container}>
      
      <LinearGradient  colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}} style ={styles.topView}>
        <Text style = {styles.welcome}>Bienvenido a</Text>
        <Text style ={styles.hostech}>HOSTECH</Text>

        <Curva/>
      </LinearGradient>

      

       <View style={styles.bottomView}>
        <Text style={styles.slogan}>Gestión profesional y control total para tu negocio de hostelería.</Text>
        
        <View style={styles.buttonsView}>
          <Button
            backgroundColor={colorPalette.azulOscuro}
            width={320}
            height={60}
            text={"Regístrate"}
            colorText={colorPalette.blanco}
            fontSize={20}
            action={() => navigation.navigate("Register")}
          />

          <Button
            backgroundColor={colorPalette.blanco}
            borderColor={colorPalette.azulOscuro}
            width={320}
            height={60}
            text={"Login"}
            colorText={colorPalette.azulOscuro}
            fontSize={20}
            action={() => navigation.navigate("Verify")}
          />
        </View>
        
        <View style={styles.footerView}>
        <Text style={styles.footer}>© 2026 HOSTECH Hospitality System </Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems:"center",
        justifyContent: "center"
    },
    topView:{
      flex:1,
      width:"100%",
      height:"50%",
      alignItems:"center",
      justifyContent:"center",


    },
    bottomView:{
      flex:1,
      backgroundColor:colorPalette.blanco,
      padding: 10,
      alignItems:"center",
      justifyContent:"space-around",
    },

    welcome:{
      color:colorPalette.blanco,
      fontFamily:"OutfitRegular",
      fontSize:20
    },
    
    hostech:{
      color:colorPalette.blanco,
      fontFamily:"OutfitExtraBold",
      fontSize:50,
    }, 

    slogan:{
      color:colorPalette.gris,
      fontFamily:"OutfitBold",
      fontSize:18,
      textAlign:"center"
    },

    buttonsView:{
      gap:15
    },

    footerView:{
      borderTopWidth:1,
      borderColor:colorPalette.gris_transparente,
      width:350,
      marginBottom:10,
      padding:5
     },

     footer:{
      fontFamily:"OutfitBold",
      color:colorPalette.gris,
      textAlign:"center"
     }
    
})