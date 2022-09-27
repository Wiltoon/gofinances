// import Intl from 'intl';
// import 'intl/locale-data/jsonp/pt-Br';

import React from 'react'; 
import { View, Text, StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components';

import { 
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';

import { Routes } from './src/routes';
import { AppRoutes } from './src/routes/app.routes';
// import { CategorySelect } from './src/screens/CategorySelect';
// import { Register } from './src/screens/Register';
import { SignIn } from './src/screens/SignIn';
// import { Dashboard } from './src/screens/Dashboard';
import { AuthProvider, useAuth } from './src/hooks/auth';

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });
  const { userStorageLoading } = useAuth();

  if (!fontsLoaded || userStorageLoading) {
    return (
      <View>
        <Text> Loading...</Text>
      </View>
    )
  }

  return (
    <ThemeProvider theme={theme}> 
      <StatusBar barStyle="light-content"/>

      <AuthProvider>
        <Routes/>
      </AuthProvider>
      
    </ThemeProvider>
  )
}
