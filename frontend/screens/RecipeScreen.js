import React, {useContext, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform,FlatList} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native";
import colorPalette from "../constant/colorPalette";
import {LinearGradient} from "expo-linear-gradient";
import { api } from "../services/api";
import { AlertContext } from "../context/AlertProvider";
import { AuthContext } from "../context/AuthProvider";
import {Ionicons} from "@expo/vector-icons"


export default function Recipes(){
    const [recipes, setRecipes] = useState([])
    const {user, token} = useContext(AuthContext)
    const {setRecipe, recipe} = useContext(AuthContext)
    const {showModal} = useContext(AlertContext)
    const navigation = useNavigation()
    const [search, setSearch] = useState("")
    const [focusedInput, setFocusedInput] = useState("")
    
    useEffect(() => {
        const getRecipes = async () =>{
            try{


                let find = `/recetas/getRecipes/${Number(user.empresa_id)}`

                if(search.trim()){
                    find+=`?words=${encodeURIComponent(search)}`
                }

                const response = await api.get(find,{
                    headers: {Authorization: `Bearer ${token}`}
                })

                setRecipes(response.data.data)

            }catch(error){
            const data = error.response?.data
            if(data?.errors){
                showModal(data.errors.join("\n"), "error")
                
            }else if(data?.error){
                showModal(data.error, "error")
                
            }else{
                showModal("Error interno del servidor", "error")
            }
            }
        }

        getRecipes()
    }, [search, user, token, recipes])

    

    

    return(
        <SafeAreaView style = {{flex:1}}>
            <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: "#ffffff"}}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View contentContainerStyle = {styles.generalView}>

                <LinearGradient 
                style={styles.brandView} 
                colors = {[colorPalette.azulOscuro, colorPalette.azulClaro]} 
                start = {{x:0, y:0}} 
                end = {{x:1, y:0}}>

                    <TouchableOpacity 
                    style={[styles.btnView, user.rol === "trabajador" && styles.btnViewAlter]} 
                    onPress={() => navigation.goBack()}>
                        <Ionicons 
                            name = "arrow-back"
                            size= {26}
                            color = {colorPalette.blanco}
                            
                            
                            
                    /> 
                    </TouchableOpacity>

                    <View style ={styles.titleAndSection}>
                        <Text style={styles.hostech}>{user.empresa}</Text>
                        <Text style={styles.welcome}>Recetas</Text>
                    </View>

                    { (user.rol === "administrador" || user.rol === "propietario") && <TouchableOpacity 
                    style={styles.btnView} 
                    onPress={() => navigation.navigate("AddRecipe")}>
                        <Ionicons 
                            name = "add"
                            size= {28}
                            color = {colorPalette.blanco}
                            
                        />     
                    </TouchableOpacity>}
                        
                </LinearGradient>
                    
                <View style={styles.searchView}>
                        <TextInput
                        style={[
                            styles.inputSearch, focusedInput === "input" && styles.focusedInput]}
                        value={search}
                        placeholder="Buscar una receta"
                        onChangeText={(text) => setSearch(text)}
                        onFocus={() => setFocusedInput("input")}
                        onBlur={() => setFocusedInput(null)}
                        />
                    </View>
                    
                    <View style={styles.listView}>
                        <FlatList
                        data={recipes}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => (
                            <TouchableOpacity 
                                style = {styles.listBtn}
                                onPress={() => {
                                    setRecipe(item)
                                    navigation.navigate("RecipeDescription")
                                }}
                                >
                                <Text style={styles.listText}>{item.nombre}</Text>
                            </TouchableOpacity>
                        )}
                        />
                    </View>
                    
                </View>
            
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

    btnViewAlter:{
        position:"absolute",
        left:20
    },

    listView:{
        justifyContent:"center",
        alignItems:"center"
    },

    listBtn:{
        width:350,
        margin:5,
        padding:10,
        borderBottomWidth:1,
        borderColor:colorPalette.gris_transparente
    },

    listText:{
        fontFamily:"OutfitBold",
        fontSize:18,
        color:colorPalette.negro
    },
    searchView:{
        padding:5,
        borderBottomWidth:1,
        borderColor:colorPalette.gris_transparente
    },

    inputSearch:{
        borderWidth:1,
        borderRadius:10,
        margin:10,
        fontFamily:"OutfitRegular",
        fontSize:16,
        padding:5
    },
    focusedInput:{
        borderWidth:1,
        borderColor:colorPalette.azulOscuro,
        fontFamily:"OutfitRegular",
        fontSize:16
    }


    

})