// App.tsx
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/db/schema';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}