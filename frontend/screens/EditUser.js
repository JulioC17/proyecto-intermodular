import React, {useCallback, useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, FlatList, Alert, Modal} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import {Ionicons} from "@expo/vector-icons"
import Button from "../components/Button";
import { AuthContext } from "../context/AuthProvider";
import DashboardWorker from "../components/DashboardWorker";
import DashboardAdmins from "../components/DashboardAdmins";
import DateTimePicker from "@react-native-community/datetimepicker"
import {Picker, picker} from "@react-native-picker/picker"


export default function EditUser({route}){
        const {user, token, activeCompany, refresh} = useContext(AuthContext)
        const {showModal} = useContext(AlertContext)
        const navigation = useNavigation()
        const {nombre, apellidos, email, telefono, dni, sueldo, id_usuario, rol, empresa} = route.params.userDescription
        const [changedEmail, setCHangedEmail] = useState(null)
        const [changedPhone, setChangedPhone] = useState(null)
        const [changedCompany, setChangedCompany] = useState(null)
        const [changedRol, setChangedRol] = useState(null)
        const [changedSalary, setChangedSalary] = useState(null)
        const [modalVisible, setModalVisible] = useState(false)
        const [modalRolVisible, setModalRolVisible] = useState(false)
        const [loading, setLoading] = useState(false)
        const [companys, setCompanys] = useState([])
        const [selectedCompany, setSelectedCompany] = useState({})
        const [selectedRol, setSelectedRol] = useState({})

        const getAllCompanys = async () => {

            try{

                const response = await api.get("/company/viewCompany", {
                    headers: {Authorization: `Bearer ${token}`}
                })

                setCompanys(response.data.companys)

            }catch(error){
            const data = error.response?.data
            if(data?.errors){
                console.log(data.errors.join("\n"), "error" )
                        
            }else if(data?.error){
                showModal(data.error, "error")
                        
            }else{
                showModal("Error interno del servidor", "error")
            }
        }
        }

        useEffect(() => {
            if(user.rol === "propietario"){
                getAllCompanys()
                    
                }
        }, [])

        const updateUser = async () => {

            try{

                setLoading(true)

                const response = await api.put(`/users/updateUser/${Number(id_usuario)}`, {
                    "telefono": changedPhone || telefono ,
                    "email": changedEmail || email,
                    "sueldo": changedSalary || sueldo
                }, {headers: {Authorization: `Bearer ${token}`}})

                if(selectedCompany.id){
                    const responseCompany = await api.put(`/company/changeCompany/${Number(id_usuario)}/company`, {
                    "companyTargetId": selectedCompany.id
                    }, {headers:{Authorization: `Bearer ${token}`}})

                    await refresh()
                    showModal(responseCompany.data.message, "success")
                }

                if(selectedRol.id){
                    const responseRol = await api.put(`/roles/changeRole/${Number(id_usuario)}`, {
                        "newRole": selectedRol.id
                    }, {headers: {Authorization: `Bearer ${token}`}})

                    showModal(responseRol.data.message, "success")
                }
                

                showModal(response.data.message, "success")
                navigation.goBack()

            }catch(error){
            const data = error.response?.data
            if(data?.errors){
                showModal(data.errors.join("\n"), "error" )
                        
            }else if(data?.error){
                showModal(data.error, "error")
                        
            }else{
                showModal("Error interno del servidor", "error")
            }
        }finally{
            setLoading(false)
        }
        }
    
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
                        <Text style={styles.welcome}>Editar Empleado</Text>
                    </View>
                    </LinearGradient>

                    <View style ={styles.listView}>
                        
                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>DATOS DE LA CUENTA</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Nombre:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{nombre} {apellidos}</Text>
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Email:</Text>
                                    <TextInput
                                    value={changedEmail}
                                    placeholder={email}
                                    onChangeText={(text) => setCHangedEmail(text)}
                                    style = {styles.inputs}
                                    ></TextInput>
                                </View>
                            </View>
                        </View>

                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>INFORMACIÓN PERSONAL</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>DNI / NIE:</Text>
                                    <Text style = {styles.infoCardsContentTextDescription}>{dni}</Text>
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Teléfono:</Text>
                                    <TextInput
                                    value={changedPhone}
                                    placeholder={telefono ? telefono : "No registrado"}
                                    onChangeText={(text) => setChangedPhone(text)}
                                    style = {styles.inputs}
                                    ></TextInput>
                                </View>
                            </View>
                        </View>

                        <View style = {styles.infoCards}>
                            <Text style = {styles.infoCardsTitle}>CONTRATO Y EMPRESA</Text>
                            <View style = {styles.infoCardsContentView}>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Empresa:</Text>
                                    { user.rol !== "propietario" ? <Text style = {styles.infoCardsContentTextDescription}>{empresa}</Text> :
                                        <TouchableOpacity
                                        onPress={() => {setModalVisible(true)
                                        }}
                                        >
                                            <Text style = {styles.infoCardsContentTextDescription}>{selectedCompany.empresa ? selectedCompany.empresa : empresa}</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Rol:</Text>
                                    {user.rol !== "propietario" ? <Text style = {styles.infoCardsContentTextDescription}>{rol}</Text> : 
                                        <TouchableOpacity
                                        onPress={() => setModalRolVisible(true)}
                                        >
                                            <Text style = {styles.infoCardsContentTextDescription}> {selectedRol.rol ? selectedRol.rol : rol}</Text>
                                        </TouchableOpacity>
                                    }
                                </View>
                        
                                <View style = {styles.infoCardsContent}>
                                    <Text style = {styles.infoCardsContentTextTitle}>Sueldo:</Text>
                                    <TextInput
                                    value={changedSalary}
                                    placeholder={sueldo ? sueldo : "No disponible"}
                                    onChangeText={(text) => setChangedSalary(text)}
                                    style = {styles.inputs}
                                    ></TextInput>
                                </View>
                            </View>
                        </View>

                        <Button
                            backgroundColor={colorPalette.azulOscuro}
                            width={280}
                            height={60}
                            text={loading ? <ActivityIndicator size= "small" color={colorPalette.blanco}/> : "Actualizar"}
                            fontSize={20}
                            colorText={colorPalette.blanco}
                            borderColor={colorPalette.azulOscuro}
                            action={() => {
                                updateUser()}}
                        />

                    </View>
                    </ScrollView>
                    {modalVisible && 
                        <Modal
                            animationType="slide"
                            visible = {modalVisible}
                            onRequestClose={() => setModalVisible(false)}
                        >
                            <View style = {styles.modalView}>
                                <TouchableOpacity
                                style = {styles.closeBtn}
                                onPress={() => setModalVisible(false)}
                                >
                                <Ionicons name = "close-outline" color ={colorPalette.gris} size={30}/>
                                </TouchableOpacity>
                                <View style = {styles.infoTextView}>
                                <Text style = {styles.infoTitle}>Seleccione Empresa</Text>
                                <Text style = {styles.infoExtraTitle}>empresa de destino a la que será cambiado el usuario</Text>
                                </View>
                                <View style = {styles.PickerView}>
                                    <Picker
                                    selectedValue={selectedCompany}
                                    onValueChange={(value) => setSelectedCompany(value)}
                                    >
                                        <Picker.Item label = "Selecciona una empresa" value = ""/>
                                        {companys.map((c, i) => {
                                            return(
                                                <Picker.Item label = {c.empresa} value = {{empresa: c.empresa, id: c.id}}/>
                                            )
                                        })}


                                    </Picker>
                                </View>

                                <Button
                                    backgroundColor={colorPalette.azulOscuro}
                                    width={280}
                                    height={60}
                                    text={"Guardar"}
                                    fontSize={20}
                                    colorText={colorPalette.blanco}
                                    borderColor={colorPalette.azulOscuro}
                                    action={() => setModalVisible(false)}
                                    />
                            </View>

                        </Modal>
                    }

                    {modalRolVisible && 
                    <Modal
                            animationType="slide"
                            visible = {modalRolVisible}
                            onRequestClose={() => setModalRolVisible(false)}
                        >
                            <View style = {styles.modalView}>
                                <TouchableOpacity
                                style = {styles.closeBtn}
                                onPress={() => setModalRolVisible(false)}
                                >
                                <Ionicons name = "close-outline" color ={colorPalette.gris} size={30}/>
                                </TouchableOpacity>
                                <View style = {styles.infoTextView}>
                                <Text style = {styles.infoTitle}>Seleccione  Rol</Text>
                                <Text style = {styles.infoExtraTitle}>Nuevo Rol que desempeñará el empleado</Text>
                                </View>
                                <View style = {styles.PickerView}>
                                    <Picker
                                    selectedValue={selectedRol}
                                    onValueChange={(value) => setSelectedRol(value)}
                                    >
                                        <Picker.Item label = "Selecciona un rol" value = ""/>
                                        <Picker.Item label = "Administrador" value = {{rol: "Administrador", id: 2}}/>
                                        <Picker.Item label = "Trabajador" value = {{rol: "Trabajador", id: 3}}/>
                                    </Picker>
                                </View>

                                <Button
                                    backgroundColor={colorPalette.azulOscuro}
                                    width={280}
                                    height={60}
                                    text={"Guardar"}
                                    fontSize={20}
                                    colorText={colorPalette.blanco}
                                    borderColor={colorPalette.azulOscuro}
                                    action={() => setModalRolVisible(false)}
                                    />
                            </View>

                        </Modal>
                    }
                    </KeyboardAvoidingView>
                    </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    generalView: {
        flexGrow:1,
        justifyContent:"space-between",
        alignItems: "center",
        marginBottom:40,
        paddingBottom:70
    },

    brandView:{
        width:"100%",
        justifyContent:"space-around",
        alignItems:"center",
        height:120,
        flexDirection:"row",
        gap:30
    },
    
    hostech:{
        fontSize:28,
        fontFamily:"OutfitExtraBold",
        color:colorPalette.blanco
    },

    titleAndSection:{
        justifyContent:"center",
        alignItems:"center"
    },

    welcome:{
        fontSize:22,
        fontFamily:"OutfitRegular",
        color:colorPalette.blanco
    },

    btnView:{
        position:"absolute",
        left:20
    },

    listView:{
        flex:1,
        marginTop:5,
        gap:20,
        alignItems:"center"
    },

    infoCards:{
        width:320,
        justifyContent:"center",
        gap:10,
        margin:10
        
    },

    infoCardsContentView:{
        borderRadius:10,
        borderWidth:1,
        borderColor:colorPalette.gris_transparente,
        padding:15,
        gap:20
    },
    infoCardsTitle:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.azulOscuro
    },

    infoCardsContent:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center"
    },

    infoCardsContentTextTitle:{
        fontFamily:"OutfitBold",
        fontSize:16,
        color:colorPalette.gris
    },

    infoCardsContentTextDescription:{
        fontFamily:"OutfitBold",
        fontSize:16,
    },

    inputs: {
        fontFamily:"OutfitRegular",
        fontSize:16,
        color:colorPalette.azulOscuro,
        flex:1,
        textAlign:"right",
        marginLeft:10
    },

    modalView:{
        flex:1,
        alignItems:"center"
    },

    closeBtn:{
        padding:10,
        width:"100%",
        alignItems:"flex-end"
    },

    infoTextView:{
        padding:10,
    },

    infoTitle:{
        fontFamily:"OutfitBold",
        fontSize:24
    },

    infoExtraTitle:{
        fontFamily:"OutfitRegular",
        fontSize:18,
        color:colorPalette.azulOscuro
    },

    PickerView:{
        padding:10,
        borderWidth:1,
        margin:20,
        borderRadius:10,
        borderColor:colorPalette.gris_transparente,
        width:280,
    },
})