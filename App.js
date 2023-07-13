import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";

import Login from './Login';
import HomeScreen from './HomeScreen';
import AccountScreen from './AccountScreen';
import MessageScreen from './MessageScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => (
  <Tab.Navigator initialRouteName="Home">
    <Tab.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{
        tabBarLabel: 'Home',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="Account" 
      component={AccountScreen} 
      options={{
        tabBarLabel: 'Account',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" color={color} size={size} />
        ),
      }}
    />
    <Tab.Screen 
      name="Messages" 
      component={MessageScreen} 
      options={{
        tabBarLabel: 'Messages',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="message" color={color} size={size} />
        ),
      }}
    />
  </Tab.Navigator>
)

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <Stack.Screen name="Home" component={TabNavigator} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
