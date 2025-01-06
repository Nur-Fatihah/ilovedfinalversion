import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import SellerDashboardScreen from '../screens/SellerDashboardScreen';
import AddItemScreen from '../screens/AddItemScreen';
import SellerProfileScreen from '../screens/SellerProfileScreen';
import EditItemScreen from '../screens/EditItemScreen';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const icons: Record<'Dashboard' | 'Profile', keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'stats-chart',
  Profile: 'person',
};

const SellerDashboardStack = ({ setIsSellerMode }: { setIsSellerMode: (value: boolean) => void }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
    <Stack.Screen name="AddItem" component={AddItemScreen} />
    <Stack.Screen name="EditItem" component={EditItemScreen} />
  </Stack.Navigator>
);

interface SellerTabNavigatorProps {
  setIsSellerMode: (value: boolean) => void;
}

const SellerTabNavigator: React.FC<SellerTabNavigatorProps> = ({ setIsSellerMode }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const iconName = icons[route.name as 'Dashboard' | 'Profile'];
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#c2185b',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard">
      {() => <SellerDashboardStack setIsSellerMode={setIsSellerMode} />}
    </Tab.Screen>
    <Tab.Screen
      name="Profile"
      children={({ navigation }) => (
        <SellerProfileScreen navigation={navigation} setIsSellerMode={setIsSellerMode} />
      )}
    />
  </Tab.Navigator>
);

export default SellerTabNavigator;
