import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useExpense } from '../context/ExpenseContext';

// Import Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionScreen from '../screens/TransactionScreen';
import AddIncomeScreen from '../screens/AddIncomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import EditTransactionScreen from '../screens/EditTransactionScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import AIChatScreen from '../screens/AIChatScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#00875A', // Green active
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F2',
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TransactionsTab') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'AddTab') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="TransactionsTab" 
        component={TransactionScreen} 
        options={{ tabBarLabel: 'Transactions' }} 
      />
      <Tab.Screen 
        name="AddTab" 
        component={DashboardScreen} // Secondary fallback target, but intercept button click
        options={{ tabBarLabel: 'Add' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default navigation
            e.preventDefault();
            // Open quick actions by navigating to AddIncome directly or similar
            // Here, we can trigger AddIncome or a choice modal. Let's navigate to AddIncome for quick entries
            navigation.navigate('AddIncome');
          },
        })}
      />
      <Tab.Screen 
        name="Stats" 
        component={StatisticsScreen} 
        options={{ tabBarLabel: 'Statistics' }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const AppNavigator = () => {
  const { user, isLoading } = useExpense();

  if (isLoading) {
    // We can return a loading screen or null during app startup
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user === null ? (
        // Auth Stack
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          
          {/* Modal / Push Screens for Actions */}
          <Stack.Screen 
            name="AddIncome" 
            component={AddIncomeScreen} 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="AddExpense" 
            component={AddExpenseScreen} 
            options={{ presentation: 'modal' }} 
          />
          <Stack.Screen 
            name="EditTransaction" 
            component={EditTransactionScreen} 
            options={{ presentation: 'card' }} 
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen} 
            options={{ presentation: 'card' }} 
          />
          <Stack.Screen 
            name="AIChat" 
            component={AIChatScreen} 
            options={{ presentation: 'card' }} 
          />

        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
