import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTheme } from './src/core/theme';
import { AppProvider } from './src/presentation/context/AppContext';
import { AppNavigator } from './src/presentation/navigation/AppNavigator'; // <--- EL NUEVO NAVIGATOR

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <PaperProvider theme={AppTheme}>
          <StatusBar style="light" />
          <AppNavigator />
        </PaperProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}