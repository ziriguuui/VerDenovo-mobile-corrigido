import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { PontosProvider } from './src/context/PontosContext';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MapaScreen from './src/screens/MapaScreen';
import DicasScreen from './src/screens/DicasScreen';
import SobreScreen from './src/screens/SobreScreen';
import DrawerMenu from './src/components/DrawerMenu';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function MainDrawer() {
  return (
    <PontosProvider>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerMenu {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="Início" component={HomeScreen} />
        <Drawer.Screen name="Mapa" component={MapaScreen} />
        <Drawer.Screen name="Dicas" component={DicasScreen} />
        <Drawer.Screen name="Sobre" component={SobreScreen} />
      </Drawer.Navigator>
    </PontosProvider>
  );
}

function RootNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Restaurando sessão salva (login anterior) — geralmente é quase instantâneo.
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainDrawer} />
      ) : (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
}
