import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type TryOnScreenProps = StackScreenProps<RootStackParamList, 'TryOnScreen'>;

const TryOnScreen: React.FC<TryOnScreenProps> = ({ route, navigation }) => {
  const { productId } = route.params;

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Virtual Try-On</Text>
      </View>

      <View style={styles.content}>
        <Image
          source={{ uri: 'https://via.placeholder.com/300x300' }} // Placeholder for product/AR model
          style={styles.image}
        />
        <Text style={styles.subtitle}>
          Try-On feature for Product ID: <Text style={styles.productId}>{productId}</Text>
        </Text>
        <Text style={styles.text}>
          Explore the virtual try-on experience. This screen will showcase AR or 3D functionality
          for the selected product.
        </Text>

        <TouchableOpacity style={styles.tryNowButton}>
          <Text style={styles.buttonText}>Try Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffeef2',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#c2185b',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c2185b',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  productId: {
    fontWeight: 'bold',
    color: '#555',
  },
  text: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  tryNowButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TryOnScreen;