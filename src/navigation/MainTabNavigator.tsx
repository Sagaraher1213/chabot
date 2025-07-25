import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Screens - Updated imports
import HomeScreen from '../screens/HomeScreen'; // Using existing HomeScreen
import TicketsScreen from '../screens/TicketsScreen';
import ProfileStackNavigator from './ProfileStackNavigator';

// Custom Chatbot Header
import ChatbotHeader from '../components/ChatbotHeader';
import DashboardStackNavigator from './DashboardStackNavigator';

const Tab = createBottomTabNavigator();

// Icon Renderer - Updated icons
const SvgIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const size = focused ? 24 : 20;

  switch (name) {
    case 'dashboard':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3"
            y="3"
            width="7"
            height="7"
            stroke={color}
            strokeWidth="2"
            fill={focused ? color : 'none'}
          />
          <Rect
            x="14"
            y="3"
            width="7"
            height="7"
            stroke={color}
            strokeWidth="2"
            fill={focused ? color : 'none'}
          />
          <Rect
            x="14"
            y="14"
            width="7"
            height="7"
            stroke={color}
            strokeWidth="2"
            fill={focused ? color : 'none'}
          />
          <Rect
            x="3"
            y="14"
            width="7"
            height="7"
            stroke={color}
            strokeWidth="2"
            fill={focused ? color : 'none'}
          />
        </Svg>
      );
    case 'tickets':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2 2 2 0 0 1 0 4 2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2 2 2 0 0 1 0-4 2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5z"
            stroke={color}
            strokeWidth="2"
            fill={focused ? color : 'none'}
          />
        </Svg>
      );
    case 'profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
          <Circle
            cx="12"
            cy="7"
            r="4"
            stroke={color}
            strokeWidth="2"
            fill={focused ? color : 'none'}
          />
        </Svg>
      );
    default:
      return null;
  }
};

interface MainTabNavigatorProps {
  userInfo: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ userInfo, onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTintColor: '#333',
        headerTitleStyle: styles.headerTitle,
      }}
    >
      {/* DASHBOARD */}
      <Tab.Screen
        name="Dashboard"
        options={({ navigation }) => ({
          tabBarIcon: ({ focused, color }) => (
            <SvgIcon name="dashboard" focused={focused} color={color} />
          ),
          headerTitle: () => <ChatbotHeader navigation={navigation} />,
        })}
      >
        {() => <HomeScreen userInfo={userInfo} />}
      </Tab.Screen>

      {/* TICKETS */}
      <Tab.Screen
        name="Tickets"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <SvgIcon name="tickets" focused={focused} color={color} />
          ),
        }}
      >
        {() => <TicketsScreen userInfo={userInfo} />}
      </Tab.Screen>

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused, color }) => (
            <SvgIcon name="profile" focused={focused} color={color} />
          ),
          headerShown: false,
        }}
      >
        {() => <ProfileStackNavigator userInfo={userInfo} onLogout={onLogout} />}
      </Tab.Screen>     
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  header: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MainTabNavigator;