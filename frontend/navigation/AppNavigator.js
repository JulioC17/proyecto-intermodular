import React from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthProvider";
import { useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import colorPalette from "../constant/colorPalette";

import Landing from "../screens/landing";
import RegisterScreen from "../screens/registerScreen";
import LoginScreen from "../screens/LoginScreen";
import VerifyEmail from "../screens/verifyEmailScreen";
import Dashboard from "../screens/DashboardScreen";
import Recipes from "../screens/RecipeScreen";
import RecipeDescription from "../screens/RecipeDescriptionScreen";
import AddRecipe from "../screens/AddRecipeScreen";
import AddCompany from "../screens/AddCompanyScreen";
import EditRecipe from "../screens/EditRecipeScreen";
import Vacaciones from "../screens/VacacionesScreen";
import RequestForHollidays from "../screens/RequestForHollidays";
import Turnos from "../screens/TurnosScreen";
import SchedulesConfig from "../screens/SchedulesConfig";
import CrudShifts from "../screens/CrudShiftsScreen";
import Timer from "../screens/TimerScreen";
import Resumen from "../screens/ResumenScreen";
import AddWorkers from "../screens/AddWorkers";
import RegisterNewWorker from "../screens/registerNewWorker";
import FirstLogin from "../screens/FirstLoginScreen";
import Profile from "../screens/ProfileScreen";
import EditUser from "../screens/EditUser";
import DayControl from "../screens/DayControlScreen";

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    const {loading, token, user} = useContext(AuthContext)

    if(loading){
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorPalette.azulOscuro }}>
            <ActivityIndicator color = "#fff" size="large"></ActivityIndicator>
            </View>
        )
    }

    return(
        <NavigationContainer>

            <Stack.Navigator>
                
                <Stack.Screen name = "Landing" component={Landing} options={{headerShown:false}}/>
                <Stack.Screen name = "Register" component={RegisterScreen} options= {{headerShown:false}}/>
                <Stack.Screen name = "AddCompany" component={AddCompany} options= {{headerShown:false}}/>
                <Stack.Screen name = "Verify" component={VerifyEmail} options={{headerShown:false}}/>
                <Stack.Screen name = "Login" component={LoginScreen} options = {{headerShown:false}}/>
                <Stack.Screen name = "FirstLogin" component = {FirstLogin} options = {{headerShown:false}}/>
                <Stack.Screen name = "Dashboard" component={Dashboard} options={{headerShown:false}}/>
                <Stack.Screen name = "Profile" component = {Profile} options = {{headerShown:false}}/>
                <Stack.Screen name = "Recipes" component = {Recipes} options = {{headerShown:false}}/>
                <Stack.Screen name = "RecipeDescription" component = {RecipeDescription} options = {{headerShown:false}}/>
                <Stack.Screen name = "AddRecipe" component = {AddRecipe} options = {{headerShown:false}}/>
                <Stack.Screen name = "EditRecipe" component = {EditRecipe} options = {{headerShown:false}}/>
                <Stack.Screen name = "Vacaciones" component = {Vacaciones} options = {{headerShown:false}}/>
                <Stack.Screen name = "RequestForHollidays" component = {RequestForHollidays} options = {{headerShown:false}}/>
                <Stack.Screen name = "Turnos" component = {Turnos} options = {{headerShown:false}}/>
                <Stack.Screen name = "SchedulesConfig" component = {SchedulesConfig} options = {{headerShown:false}}/>
                <Stack.Screen name = "CrudShifts" component = {CrudShifts} options = {{headerShown:false}}/>
                <Stack.Screen name = "Timer" component = {Timer} options = {{headerShown:false}}/>
                <Stack.Screen name = "Resumen" component = {Resumen} options = {{headerShown:false}}/>
                <Stack.Screen name = "AddWorkers" component = {AddWorkers} options = {{headerShown:false}}/>
                <Stack.Screen name = "EditUser" component={EditUser} options={{headerShown:false}}/>
                <Stack.Screen name = "RegisterNewWorker" component = {RegisterNewWorker} options = {{headerShown:false}}/>
                <Stack.Screen name = "DayControl" component = {DayControl} options = {{headerShown:false}}/>
            
            </Stack.Navigator>

        </NavigationContainer>
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
        justifyContent:"center",
        alignItems:"center",
        height:150
    },

    hostech:{
        fontSize:28,
        fontFamily:"OutfitExtraBold",
        color:colorPalette.blanco
    },

    welcome:{
        fontSize:16,
        fontFamily:"OutfitRegular",
        color:colorPalette.blanco
    },
})

//

