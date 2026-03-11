import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { AuthProvider } from './context/AuthProvider';
import { AlertProvider } from './context/AlertProvider';
import AppNavigator from "./navigation/AppNavigator"
import { AlertModal } from './components/ResModal';
import { useFonts } from 'expo-font';

export default function App() {
  const [fontsLoaded] = useFonts({
    OutfitRegular: require("./assets/Outfit/static/Outfit-Regular.ttf"),
    OutfitMedium: require("./assets/Outfit/static/Outfit-Medium.ttf"),
    OutfitBold: require("./assets/Outfit/static/Outfit-Bold.ttf"),
    OutfitExtraBold: require("./assets/Outfit/static/Outfit-ExtraBold.ttf")
  });

  if (!fontsLoaded) {
    return null;
}

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
