import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import TicketInsightsScreen from '../screens/Dashboard/TicketInsightsScreen';
import MyTicketsScreen from '../screens/Tickets/MyTicketsScreen';
import TicketDetailsScreen from '../screens/Tickets/TicketDetailsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TicketInsights" component={TicketInsightsScreen} options={{ title: 'Ticket Insights' }} />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} options={{ title: 'My Tickets' }} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} options={{ title: 'Ticket Details' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
