import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import BuyerTabNavigator from './BuyerTabNavigator';
import SellerTabNavigator from './SellerTabNavigator';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ChatScreen from '../screens/ChatScreen';
import ReportScreen from '../screens/ReportScreen';
import TryOnScreen from '../screens/TryOnScreen';
import ErrorScreen from '../screens/ErrorScreen';
import EditItemScreen from '../screens/EditItemScreen';
import { useAuthContext } from '../context/AuthContext';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [isSellerMode, setIsSellerMode] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="BuyerTabs">
              {() => <BuyerTabNavigator setIsSellerMode={setIsSellerMode} />}
            </Stack.Screen>
            <Stack.Screen name="SellerTabs">
              {() => <SellerTabNavigator setIsSellerMode={setIsSellerMode} />}
            </Stack.Screen>
            <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="ReportScreen" component={ReportScreen} />
            <Stack.Screen name="TryOnScreen" component={TryOnScreen} />
            <Stack.Screen name="EditItem" component={EditItemScreen} />
            <Stack.Screen
              name="ErrorScreen"
              component={ErrorScreen}
              initialParams={{ message: 'An unexpected error occurred' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
