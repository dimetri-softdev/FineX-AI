// App.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/db/schema';
import { Colors } from './src/theme/colors';
import { useAuthStore } from './src/store/useAuthStore';
import { useSyncStore } from './src/store/useSyncStore';
import { useTransactionStore } from './src/store/useTransactionStore';

export default function App() {
  const [startupError, setStartupError] = useState<string | null>(null);
  const authLoading = useAuthStore((state) => state.loading);
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    let unsubscribeAuth: (() => void) | undefined;
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        initDatabase();
        unsubscribeAuth = initializeAuth();
      } catch (error) {
        console.error('Failed to initialize the app:', error);
        if (active) {
          setStartupError(
            error instanceof Error
              ? error.message
              : 'Unable to initialize FineX.',
          );
        }
      }
    });

    return () => {
      active = false;
      unsubscribeAuth?.();
    };
  }, [initializeAuth]);

  useEffect(() => {
    if (startupError || authLoading) return;

    useTransactionStore.getState().fetchTransactions();
    useTransactionStore.getState().fetchBudgets();
    useTransactionStore.getState().fetchSpendingBreakdown();
    useSyncStore.getState().getPendingCount();
  }, [authLoading, startupError, userId]);

  if (startupError || authLoading) {
    return (
      <SafeAreaProvider>
        <View style={styles.startup}>
          {startupError ? (
            <Text style={styles.startupError}>{startupError}</Text>
          ) : (
            <ActivityIndicator size="large" color={Colors.primary} />
          )}
        </View>
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <BottomTabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  startup: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  startupError: {
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});