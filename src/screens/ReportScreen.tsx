import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { db } from '../../firebase-config';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext';

const ReportScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { productId } = route.params;
  const { user } = useAuthContext();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProductDetails = async () => {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProduct(docSnap.data());
      } else {
        Alert.alert('Error', 'Product not found.');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to fetch product details.');
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const handleReport = async () => {
    if (!reason.trim() || !details.trim()) {
      Alert.alert('Error', 'Please provide a reason and additional details.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You need to log in to report an item.');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: user.email,
        productId,
        productName: product?.name || 'Unknown Product',
        reason,
        details,
        createdAt: serverTimestamp(),
        status: 'pending',
        productImage: product?.images?.[0] || product?.imageUrl || '', // Include image
      });
      Alert.alert('Success', 'Report submitted successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {product ? (
          <>
            {/* Horizontal ScrollView for product images */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
              {product.images?.map((imageUri: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: imageUri }}
                  style={styles.productImage}
                />
              )) || (
                <Image
                  source={{ uri: product.imageUrl || 'https://via.placeholder.com/150' }}
                  style={styles.productImage}
                />
              )}
            </ScrollView>

            <Text style={styles.productName}>{product.name || 'Unnamed Product'}</Text>
          </>
        ) : (
          <ActivityIndicator size="large" color="#c2185b" />
        )}

        <Text style={styles.title}>Report Product</Text>
        <Text style={styles.subtitle}>Please fill in the details below to report this product.</Text>

        <TextInput
          style={styles.input}
          placeholder="Reason for reporting"
          value={reason}
          onChangeText={setReason}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Additional details"
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleReport}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Report'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#c2185b',
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  imageCarousel: {
    marginBottom: 20,
  },
  productImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c2185b',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#c2185b',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReportScreen;
