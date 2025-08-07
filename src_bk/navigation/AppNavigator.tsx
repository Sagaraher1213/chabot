import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import NotificationScreen from '../screens/NotificationScreen';
import CalendarScreen from '../screens/CalendarScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: { onLogin?: (user: any) => void };
  Register: { onRegister?: (user: any) => void };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = ({onLogin}:{onLogin:(user:any)=>void}) => {
  
  const handleRegister = (user: any) => {
    // Handle registration - you can save to database or array here
    console.log('New user registered:', user);
    // For now, just log them in after registration
    onLogin(user);
  };

  return (
    <Stack.Navigator 
      initialRouteName="Splash" 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        initialParams={{ onLogin }}
      /> 
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        initialParams={{ onRegister: handleRegister }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;