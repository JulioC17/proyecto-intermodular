import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export function ErrorModal({visible, message, onClose}){
    return (
        <Modal
            transparent={true}
            visible = {visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style = {styles.overlay}>
                
                <View style = {styles.modal}>
                    
                    <Text style= {styles.title}>Error</Text>
                    <Text>{message}</Text>
                    <TouchableOpacity onPress={onClose} style = {styles.closeBtn}>
                        <Text style = {styles.closeText}>Cerrar</Text>
                    </TouchableOpacity>
                
                </View>
            </View>
        </Modal>
    )
}

export function SuccesModal({visible, message, onClose}){
    return (
        <Modal
            transparent={true}
            visible = {visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style = {styles.overlay}>
                
                <View style = {styles.modal}>
                    
                    <Text style= {styles.titleSucces}>Success</Text>
                    <Text>{message}</Text>
                    <TouchableOpacity onPress={onClose} style = {styles.closeBtn}>
                        <Text style = {styles.closeText}>Cerrar</Text>
                    </TouchableOpacity>
                
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modal: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5, // sombra Android
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#ff0000"
  },
  closeBtn: {
    marginTop: 15,
    alignSelf: "flex-end",
  },
  closeText: {
    color: "blue",
  },

  titleSucces:{
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#06b200"
  }
})