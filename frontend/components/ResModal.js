import React, { useEffect, useRef, useContext } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import colorPalette from "../constant/colorPalette";
import { AlertContext } from "../context/AlertProvider";



const {width} = Dimensions.get("window")

export function AlertModal(){
   const slideAnim = useRef(new Animated.Value(-150)).current
   const {modal, hideModal} = useContext(AlertContext)
    
    useEffect(() => {
        const duration = modal.type === "success" ? 1500 : 2500
        if(modal.visible) {
            slideAnim.setValue(-150)
            Animated.timing(slideAnim,{
                toValue:20,
                duration:150,
                useNativeDriver:true
            }).start()

            const timer = setTimeout(() => {
                Animated.timing(slideAnim, {
                    toValue:-150,
                    duration:150,
                    useNativeDriver:true
                }).start(() => hideModal())
            }, duration)
            return () => clearTimeout(timer)
            
        }
        
    }, [modal.visible])

        if(!modal.visible) return null
    
    return (
        <Animated.View style={[modal.type === "success" ? styles.success : styles.error, {transform: [{translateY: slideAnim}]}]}>
            <Text style = {styles.message}>{modal.message}</Text>
        </Animated.View>
    )
}
const styles = StyleSheet.create({
   
  success:{
    position:"absolute",
    top:20,
    width: width - 40,
    alignSelf:"center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius:10,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 2},
    elevation: 10,
    zIndex: 1000,
    borderLeftWidth:10,
    borderColor:"#00a200",
    alignItems:"center"
  },
  error:{
    position:"absolute",
    top:20,
    width: width - 40,
    alignSelf:"center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius:10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 2},
    elevation: 5,
    zIndex: 1000,
    borderLeftWidth:10,
    borderColor:"#c60000",
    alignItems:"center"
  },
  message:{
    color: colorPalette.azulOscuro,
    fontWeight: "bold",
    textAlign:"center"
  }
})