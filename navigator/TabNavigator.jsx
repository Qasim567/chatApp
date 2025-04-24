import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
      <Tab.Navigator screenOptions={{ 
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#6C63FF",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: '#000'
        }
      }}
      >
        <Tab.Screen 
          name="HomeScreen" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} />,
          }} 
        />
        <Tab.Screen 
          name="ProfileScreen" 
          component={ProfileScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="person" color={color} size={size} />,
          }} 
        />
      </Tab.Navigator>
    );
  }