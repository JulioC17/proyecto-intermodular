import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { AuthProvider } from './context/AuthProvider';
import AppNavigator from "./navigation/AppNavigator"


export default function App() {
  return (
    <AuthProvider>
     <AppNavigator/>
     <StatusBar
          barStyle="dark-content"  // texto de hora e iconos oscuros
      />
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
