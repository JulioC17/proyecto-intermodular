/*import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Landing from "../screens/landing";

import { AuthContext } from "../context/AuthProvider";

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    const {token, loading} = useContext(AuthContext)
    if(loading) return null

    return(
        <NavigationContainer>

            <Stack.Navigator>

               
                  

            </Stack.Navigator>

        </NavigationContainer>
    )
}*/