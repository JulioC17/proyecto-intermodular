import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { AuthProvider } from './context/AuthProvider';
//import AppNavigator from "./navigation/AppNavigator"
import Landing from "../frontend/screens/Landing";

export default function App() {
  return (
    <AuthProvider>
      <View style = {styles.container}>
        <Landing/>
        <StatusBar style = "auto"/>
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
