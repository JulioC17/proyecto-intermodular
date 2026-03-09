import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { AuthProvider } from './context/AuthProvider';
import { AlertProvider } from './context/AlertProvider';
import AppNavigator from "./navigation/AppNavigator"
import { AlertModal } from './components/ResModal';

export default function App() {
  return (
    <AlertProvider>
        <AuthProvider>
            <AppNavigator/>
              <AlertModal/>
              <StatusBar
                barStyle="dark-content"  // texto de hora e iconos oscuros
              />
        </AuthProvider>
    </AlertProvider>
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
