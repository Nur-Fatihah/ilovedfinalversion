import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type ErrorScreenProps = StackScreenProps<RootStackParamList, 'ErrorScreen'>;

const ErrorScreen: React.FC<ErrorScreenProps> = ({ route, navigation }) => {
  const errorMessage = route.params?.message || 'Something went wrong. Please try again.';

  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => navigation.navigate('Splash')} // Navigate back to the main entry point
      >
        <Text style={styles.retryButtonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffeef2',
    padding: 20,
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#c2185b',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#c2185b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ErrorScreen;
