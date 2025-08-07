import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../screens/ProfileScreen';
import UpdatePasswordScreen from '../screens/UpdatePasswordScreen';
import UpdateEmailScreen from '../screens/UpdateEmailScreen'; 

const Stack = createStackNavigator();

interface ProfileStackNavigatorProps {
  userInfo: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

const ProfileStackNavigator: React.FC<ProfileStackNavigatorProps> = ({ userInfo, onLogout }) => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Profile" 
        options={{ headerShown: false }}
      >
        {() => <ProfileScreen userInfo={userInfo} onLogout={onLogout} />}
      </Stack.Screen>
      <Stack.Screen 
        name="UpdatePassword" 
        component={UpdatePasswordScreen}
        options={{
          title: 'Update Password',
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="UpdateEmail" 
        options={{
          title: 'Update Email Address',
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {() => <UpdateEmailScreen userInfo={userInfo} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default ProfileStackNavigator;