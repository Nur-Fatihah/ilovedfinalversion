import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MessageScreen from '../screens/MessageScreen';
import WishlistScreen from '../screens/WishlistScreen';
import ProfileScreen from '../screens/ProfileScreen';

type TabRoutes = {
  Home: undefined;
  Messages: undefined;
  Wishlist: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabRoutes>();

interface BuyerTabNavigatorProps {
  setIsSellerMode: (value: boolean) => void;
}

const BuyerTabNavigator: React.FC<BuyerTabNavigatorProps> = ({ setIsSellerMode }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons: Record<keyof TabRoutes, keyof typeof Ionicons.glyphMap> = {
          Home: focused ? 'home' : 'home-outline',
          Messages: focused ? 'chatbubble' : 'chatbubble-outline',
          Wishlist: focused ? 'heart' : 'heart-outline',
          Profile: focused ? 'person' : 'person-outline',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#c2185b',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Messages" component={MessageScreen} />
    <Tab.Screen name="Wishlist" component={WishlistScreen} />
    <Tab.Screen
      name="Profile"
      children={({ navigation }) => (
        <ProfileScreen
          navigation={navigation}
          setIsSellerMode={setIsSellerMode}
        />
      )}
    />
  </Tab.Navigator>
);

export default BuyerTabNavigator;
