import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthProvider";
import { useContext } from "react";

import Landing from "../screens/landing";
import RegisterScreen from "../screens/registerScreen";

const Stack = createNativeStackNavigator()


export default function AppNavigator() {
    const {loading, token} = useContext(AuthContext)
    if(loading) return null

    return(
        <NavigationContainer>

            <Stack.Navigator>
                <Stack.Screen name = "Landing" component={Landing} options={{headerShown:false}}/>
                <Stack.Screen name = "Register" component={RegisterScreen} options= {{headerShown:false}}/>
               
                  

            </Stack.Navigator>

        </NavigationContainer>
    )
}