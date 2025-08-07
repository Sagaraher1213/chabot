import React, { useState, useEffect } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from './src/screens/SplashScreen';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AppNavigator from './src/navigation/AppNavigator';

export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: string;
}

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: User): void => {
    setUserInfo(user);
    setIsLoggedIn(true);
  };

  const handleLogout = (): void => {
    setUserInfo(null);
    setIsLoggedIn(false);
  };

  const renderScreen = () => {
    if (showSplash) return <SplashScreen />;
    if (!isLoggedIn || !userInfo) return <AppNavigator onLogin={handleLogin} />;
    return <MainTabNavigator userInfo={userInfo} onLogout={handleLogout} />;
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        {renderScreen()}
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
