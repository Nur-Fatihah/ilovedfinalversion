import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuthContext } from './src/context/AuthContext';
import MainNavigator from './src/navigation/Navigation';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

const AppLoader: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#c2185b" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <MainNavigator />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppLoader />
      </GestureHandlerRootView>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeef2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#c2185b',
  },
});

export default App;
