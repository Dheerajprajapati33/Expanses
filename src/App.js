import React from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { ExpenseProvider } from './context/ExpenseContext';
import AppNavigator from './navigation/AppNavigator';
import { Platform } from 'react-native';

// Suppress third-party library warnings (e.g. react-navigation/paper pointerEvents deprecation warnings)
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      const msg = args[0];
      if (
        msg.includes('props.pointerEvents is deprecated') || 
        msg.includes('style props are deprecated. Use')
      ) {
        return;
      }
    }
    originalWarn(...args);
  };
}

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#00875A',
    secondary: '#004D40',
  },
};

const App = () => {
  return (
    <ExpenseProvider>
      <PaperProvider theme={theme}>
        <View style={{ flex: 1, height: Platform.OS === 'web' ? '100vh' : '100%', width: '100%' }}>
          <NavigationContainer>
            <StatusBar 
              barStyle="dark-content" 
              backgroundColor="#FFFFFF" 
              translucent={false} 
            />
            <AppNavigator />
          </NavigationContainer>
        </View>
      </PaperProvider>
    </ExpenseProvider>
  );
};

export default App;
