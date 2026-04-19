import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal, TouchableWithoutFeedback, Keyboard, Alert} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import {Ionicons} from "@expo/vector-icons"
import Button from "../components/Button";
import { AuthContext } from "../context/AuthProvider";


export default function CompanyManagement(){
    const navigation = useNavigation()
    const {showModal} = useContext(AlertContext)
    const {user, token, refresh} = useContext(AuthContext)

    const [loading, setLoading] = useState(false)
    const [companys, setCOmpanys] = useState([])
    const [showActive, setShowActive] = useState(true)
    const [modalEditVisible, setModalEditVisible] = useState(false)
    const [modalCreateVisible, setModalCreateVisible] = useState(false)
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [editName, setEditName] = useState("")
    const [editEmail, setEditEmail] = useState("")
    const [editCompany, setEditCompany] = useState(null)
    const [inputFocused, setInputFocused] = useState("")

    useEffect(() => {
        getCOmpanys()
    }, [showActive])


    const getCOmpanys = async() => {
        try{

            setLoading(true)
            const response = await api.get(`/company/viewCompany?active=${showActive}`, {
                headers: {Authorization: `Bearer ${token}`}
            })

            setCOmpanys(response.data.companys)

        }catch(error){
            const data = error.response?.data
            console.log(error)
            if(data?.errors){
                showModal(data.errors.join("\n"), "error")
                
            }else if(data?.error){
                showModal(data.error, "error")
                
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
    }

    const deleteCompany = async (id) => {
        try{

            setLoading(true)
            const response = await api.put(`/company/deleteCompany/${id}`, {}, {
                headers: {Authorization: `Bearer ${token}`}
            })

            showModal(response.data.message, "success")
            refresh()
            getCOmpanys()
            refresh()

        }catch(error){
            const data = error.response?.data
            console.log(error)
            if(data?.errors){
                showModal(data.errors.join("\n"), "error")
                
            }else if(data?.error){
                showModal(data.error, "error")
                
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
    }

    const addCOmpany = async () => {
        try{

            setLoading(true)
           
            const response = await api.post("/company/createCompany", {
                "nombre": newName.trim(),
                "email": newEmail.trim() === "" ? null : newEmail.trim()
            },{headers: {Authorization: `Bearer ${token}`}})

            showModal(response.data.message, "success")
            getCOmpanys()
            refresh()
            

        }catch(error){
            const data = error.response?.data
            console.log(error)
            if(data?.errors){
                showModal(data.errors.join("\n"), "error")
                
            }else if(data?.error){
                showModal(data.error, "error")
                
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
    }

    const updateCompany = async (id) => {
        try{

            setLoading(true)
            const response = await api.put(`/company/updateCompany/${Number(id)}`,{
                "nombre": editName,
                "email": editEmail
            }, {headers: {Authorization: `Bearer ${token}`}})

            showModal(response.data.message, "success")
            getCOmpanys()
            refresh()

        }catch(error){
            const data = error.response?.data
            console.log(error)
            if(data?.errors){
                showModal(data.errors.join("\n"), "error")
                
            }else if(data?.error){
                showModal(data.error, "error")
                
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
    }

    const restoreCompany = async (id) => {
        try{

            setLoading(true)
            const response = await api.put(`company/restoreCompany/${Number(id)}`, {},{
                headers: {Authorization: `Bearer ${token}`}
            })

            showModal(response.data.message, "success")
            refresh()
            getCOmpanys()

        }catch(error){
            const data = error.response?.data
            console.log(error)
            if(data?.errors){
                showModal(data.errors.join("\n"), "error")
                
            }else if(data?.error){
                showModal(data.error, "error")
                
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
    }

    //hacerl el modal para edicion, hacer nueva pantalla para creacion, hacer alerta para eliminacion, poner pestanias de estados

    
    return(
        <SafeAreaView style = {{flex:1}}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, backgroundColor: "#ffffff"}}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView contentContainerStyle = {styles.generalView}>
                   
                  <LinearGradient style={styles.brandView} colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} start = {{x:0, y:0}} end = {{x:1, y:0}}>
                    <TouchableOpacity 
                    style={styles.btnView} 
                    onPress={() => navigation.goBack()}>
                        <Ionicons 
                            name = "arrow-back"
                            size= {26}
                            color = {colorPalette.blanco}
                        /> 
                    </TouchableOpacity>

                    <View style ={styles.titleAndSection}>
                        <Text style={styles.hostech}>{"HOSTECH"}</Text>
                        <Text style={styles.welcome}>Mis Empresas</Text>
                    </View>

                     <TouchableOpacity 
                     style = {styles.editBtn}
                     onPress={() => {
                        setModalCreateVisible(true)
                     }}
                     >
                                <Ionicons name = "add-outline" size = {26}  color = {colorPalette.blanco}/>
                    </TouchableOpacity>
                    
                    </LinearGradient>
                    <View style = {styles.activeAndNotActiveView}>
                        <TouchableOpacity 
                            style = {[showActive === true ? styles.activeFocused : styles.active]}
                            onPress={() => {
                                setShowActive(true)
                            }}
                        >
                        <Text 
                            style = {[showActive === true ? styles.activeTextFocused : styles.activeText]}
                        >Activas</Text>
                        </TouchableOpacity>
                    
                        <TouchableOpacity 
                            style  = {[showActive === false ? styles.activeFocused : styles.eliminadas]}
                            onPress={() => {
                                setShowActive(false)
                            }}
                        >
                            <Text 
                                style = {[ showActive === false ? styles.activeTextFocused : styles.eliminadasText]}
                             >Eliminadas</Text>
                        </TouchableOpacity>
                        </View>

                    <View style = {styles.listView}>
                    {companys.map((e, i) => (
                        <View key={i} style = {styles.cardView}>
                            <View style = {styles.infoView}>
                                <Text style = {styles.companyName}>Empresa: {e.empresa}</Text>
                                <Text style = {styles.comapanyEmail}>Email: {e.email === null ? "No registrado" : e.email}</Text>
                                <Text style = {styles.companyWorkers}>Trabajadores: {e.num_trabajadores}</Text>
                            </View>
                            <View style = {styles.btnsView}>
                               { e.is_active ? 
                               <>
                               <TouchableOpacity 
                               style = {styles.editBtn}
                               onPress={() => {
                                setModalEditVisible(true)
                                setEditName(e.empresa)
                                setEditEmail(e.email)
                            }}
                               >
                                    <Ionicons name = "settings-outline" size = {28}  color = {colorPalette.azulOscuro}/>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                style = {styles.deleteBtn}
                                onPress={() => Alert.alert(
                                    "Eliminar Empresa",
                                    "Estás seguro de eliminar esta empresa?",
                                    [{
                                        text: "Cancelar",
                                        style: "cancel" 
                                    },{
                                        text: "Eliminar", 
                                        style: "destructive",
                                        onPress: () => deleteCompany(e.id)
                                    }]
                                )}
                                >
                                    <Ionicons name = "trash-outline" size = {28}  color = "#e00000"/>
                                </TouchableOpacity>
                                </> :
                                
                                <TouchableOpacity 
                                style = {styles.restoreBtn}
                                onPress={() => restoreCompany(e.id)}
                                >
                                    <Text style = {styles.restoreText}>Restaurar</Text>
                                </TouchableOpacity>
                                
                                }
                            </View>
                        </View>
                    ))}
                    </View>
                    </ScrollView>
                    {modalCreateVisible && 
                    <Modal
                    animationType="slide"
                    visible = {modalCreateVisible}
                    onRequestClose={() => setModalCreateVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible = {false}>
                        <View style = {styles.generalViewModal}>
                            <View style = {styles.headerModal}>
                                <Text style = {styles.headerText}>Crea tu Nueva Empresa</Text>
                                <TouchableOpacity style = {styles.closeBtn}
                                onPress={() => setModalCreateVisible(false)}
                                >
                                    <Ionicons name = "close-outline" size = {26}/>
                                </TouchableOpacity>

                            </View>

                            <View style = {styles.inputModalView}>
                                <View style = {styles.nombreInputModalView}>
                                    <Text style = {styles.nombreInputModalText}>Nombre</Text>
                                    <TextInput 
                                    style = {[styles.nombreInputModalinput, inputFocused === "nombre" && styles.inputFocused]}
                                    value={newName}
                                    placeholder="Escribe el nombre de tu empresa"
                                    onChangeText={(text) => setNewName(text)}
                                    onFocus={() => setInputFocused("nombre")}
                                    onBlur={() => setInputFocused("")}
                                    ></TextInput>
                                </View>
                                     
                                 <View style = {styles.nombreInputModalView}>
                                    <Text style = {styles.nombreInputModalText}>Email (opcional)</Text>
                                    <TextInput 
                                    style = {[styles.nombreInputModalinput, inputFocused === "email" && styles.inputFocused]}
                                    value={newEmail}
                                    placeholder="Escribe el email de tu empresa"
                                    onChangeText={(text) => setNewEmail(text)}
                                    onFocus={() => setInputFocused("email")}
                                    onBlur={() => setInputFocused("")}
                                    ></TextInput>
                                </View>
                            </View>

                            <Button
                            backgroundColor={colorPalette.azulOscuro}
                            width={320}
                            height={60}
                            borderColor={colorPalette.azulOscuro}
                            text={loading ? <ActivityIndicator
                            size= "small" color={colorPalette.blanco}
                            /> : "Crear nueva empresa"}
                            colorText={colorPalette.blanco}
                            fontSize={20}
                            disabled={loading}
                            action={() => {
                                addCOmpany()
                                setModalCreateVisible(false)
                                setNewEmail("")
                                setNewName("")
                            }}
                            />

                        </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                    }

                    {modalEditVisible && 
                    <Modal
                    animationType="slide"
                    visible = {modalEditVisible}
                    onRequestClose={() => setModalEditVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible = {false}>
                        <View style = {styles.generalViewModal}>
                            <View style = {styles.headerModal}>
                                <Text style = {styles.headerText}>Edita tu Empresa</Text>
                                <TouchableOpacity style = {styles.closeBtn}
                                onPress={() => setModalEditVisible(false)}
                                >
                                    <Ionicons name = "close-outline" size = {26}/>
                                </TouchableOpacity>

                            </View>

                            <View style = {styles.inputModalView}>
                                <View style = {styles.nombreInputModalView}>
                                    <Text style = {styles.nombreInputModalText}>Nuevo Nombre de tu empresa</Text>
                                    <TextInput 
                                    style = {[styles.nombreInputModalinput, inputFocused === "nombre" && styles.inputFocused]}
                                    value={editName}
                                    onChangeText={(text) => setEditName(text)}
                                    onFocus={() => setInputFocused("nombre")}
                                    onBlur={() => setInputFocused("")}
                                    ></TextInput>
                                </View>
                                     
                                 <View style = {styles.nombreInputModalView}>
                                    <Text style = {styles.nombreInputModalText}>Nuevo Email (opcional)</Text>
                                    <TextInput 
                                    style = {[styles.nombreInputModalinput, inputFocused === "email" && styles.inputFocused]}
                                    value={editEmail}
                                    placeholder="Nuevo email de tu empresa"
                                    onChangeText={(text) => setEditEmail(text)}
                                    onFocus={() => setInputFocused("email")}
                                    onBlur={() => setInputFocused("")}
                                    ></TextInput>
                                </View>
                            </View>

                            <Button
                            backgroundColor={colorPalette.azulOscuro}
                            width={320}
                            height={60}
                            borderColor={colorPalette.azulOscuro}
                            text={loading ? <ActivityIndicator
                            size= "small" color={colorPalette.blanco}
                            /> : "Guardar Cambios"}
                            colorText={colorPalette.blanco}
                            fontSize={20}
                            disabled={loading}
                            action={() => {
                                updateCompany(editCompany)
                                setModalEditVisible(false)
                                setEditEmail("")
                                setEditName("")
                            }}
                            />

                        </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                        }
                    </KeyboardAvoidingView>
                    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    generalView: {
        flexGrow:1,
        alignItems: "center",
        marginBottom:40
    },

    brandView:{
        width:"100%",
        justifyContent:"space-around",
        alignItems:"center",
        height:120,
        flexDirection:"row",
    },

    hostech:{
        fontSize:28,
        fontFamily:"OutfitExtraBold",
        color:colorPalette.blanco
    },

    welcome:{
        fontSize:22,
        fontFamily:"OutfitRegular",
        color:colorPalette.blanco
    },

    titleAndSection:{
        justifyContent:"center",
        alignItems:"center"
    },
    listView:{
        flexGrow:1
    },

    cardView:{
        padding:10,
        flexDirection:"row",
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        width:320,
        justifyContent:"space-between",
        margin:10,
        borderRadius:10,
        alignItems:"center"
    },

    infoView:{
        gap:5
    },

    companyName:{
        fontFamily:"OutfitBold",
        fontSize:16
    },

    comapanyEmail:{
         fontFamily:"OutfitBold",
        fontSize:16
    },

    companyWorkers:{
        fontFamily:"OutfitBold",
        fontSize:16
    },
    btnsView:{
        flexDirection:"row",
        gap:10
    },

    activeAndNotActiveView:{
        flexDirection:"row",
        gap:20,
        margin:20
    },

    active:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:10,
        borderRadius:20,
        width:150,
        justifyContent:"center",
        alignItems:"center"
    },

    eliminadas:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:10,
        borderRadius:20,
        width:150,
        justifyContent:"center",
        alignItems:"center"
    },

    activeText:{
        fontFamily:"OutfitBold",
        fontSize:18
    },

    eliminadasText:{
        fontFamily:"OutfitBold",
        fontSize:18
    },

    activeFocused:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:10,
        borderRadius:20,
        width:150,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:colorPalette.azulOscuro,
        shadowColor:colorPalette.negro,
        shadowOffset:{width:5, height:5},
        shadowOpacity:1,
        elevation:8,
    },

    activeTextFocused:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.blanco
    },

    generalViewModal:{
        flex:1,
        alignItems:"center"
    },

    headerModal:{
        flexDirection:"row",
        justifyContent:"space-between",
        width:330,
        marginVertical:30,
        alignItems:"center"
    },

    headerText:{
        fontFamily:"OutfitBold",
        fontSize:24,
        color:colorPalette.azulOscuro
    },

    closeBtn:{
        backgroundColor:colorPalette.gris_transparente,
        padding:5,
        borderRadius:30
    },

    inputModalView:{
        justifyContent:"flex-start",
        width:330
    },

    nombreInputModalView:{
        padding:10,
        margin:10
    },

    nombreInputModalText:{
        fontFamily:"OutfitBold",
        fontSize:20,
    },

    nombreInputModalinput:{
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        borderRadius:10,
        padding:10
    },

    inputFocused:{
        borderColor:colorPalette.azulOscuro
    },

    restoreBtn:{
        padding:10,
        backgroundColor:colorPalette.azulOscuro,
        borderRadius:10,

    },

    restoreText:{
        fontFamily:"OutfitBold",
        color:colorPalette.blanco,
        fontSize:16
    }



    
})