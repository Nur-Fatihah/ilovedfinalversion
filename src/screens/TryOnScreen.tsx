import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';

const TryOnScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { productId } = route.params;
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProductImage = async () => {
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        setProductImage(productSnap.data().images?.[0] || null);
      } else {
        Alert.alert('Error', 'Product not found.');
      }
    } catch (error) {
      console.error('Error fetching product image:', error);
      Alert.alert('Error', 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductImage();
  }, [productId]);

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setUploadedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload the photo. Please try again.');
    }
  };

  const handleTryOn = () => {
    if (!uploadedPhoto) {
      Alert.alert('Error', 'Please upload a full-body photo before trying on the product.');
      return;
    }

    Alert.alert(
      'Try-On Feature',
      'This is where the Try-On experience would be implemented.',
      [{ text: 'OK' }]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#c2185b" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Virtual Try-On</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>
          Try-On feature for Product ID: <Text style={styles.productId}>{productId}</Text>
        </Text>

        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No product image available</Text>
          </View>
        )}

        <Text style={styles.text}>
          Upload a full-body photo to explore the Try-On experience for the selected product.
        </Text>

        {uploadedPhoto ? (
          <Image source={{ uri: uploadedPhoto }} style={styles.uploadedPhoto} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No photo uploaded</Text>
          </View>
        )}

        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPhoto}>
          <Text style={styles.buttonText}>
            {uploadedPhoto ? 'Change Photo' : 'Upload Photo'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tryNowButton, !uploadedPhoto && styles.disabledButton]}
          onPress={handleTryOn}
          disabled={!uploadedPhoto}
        >
          <Text style={styles.buttonText}>Try On</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 20,
    alignItems: 'center',
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
  productImage: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholder: {
    width: 300,
    height: 300,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  uploadedPhoto: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
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
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default TryOnScreen;
