import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'react-native';

// Dummy screens for architecture shell
const HomeScreen = () => null;
const LiveScreen = () => null;
const PrayerScreen = () => null;
const ProfileScreen = () => null;

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" />
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { backgroundColor: '#1C1917', borderTopColor: '#292524' },
                    tabBarActiveTintColor: '#0ea5e9'
                }}
            >
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Live" component={LiveScreen} />
                <Tab.Screen name="Prayer" component={PrayerScreen} />
                <Tab.Screen name="Profile" component={ProfileScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
