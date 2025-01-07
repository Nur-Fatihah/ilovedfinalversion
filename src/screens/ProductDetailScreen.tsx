import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { db, saveDocument } from '../../firebase-config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { productId } = route.params;
  const { user } = useAuthContext();
  const [product, setProduct] = useState<any | null>(null);
  const [seller, setSeller] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();
        setProduct(productData);

        // Fetch seller details
        if (productData.sellerId) {
          const sellerRef = doc(db, 'users', productData.sellerId);
          const sellerSnap = await getDoc(sellerRef);
          if (sellerSnap.exists()) {
            setSeller(sellerSnap.data());
          }
        }
      } else {
        Alert.alert('Error', 'Product not found.');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const addToWishlist = async () => {
    if (!user) {
      Alert.alert('Error', 'You need to log in to add items to your wishlist.');
      return;
    }

    setWishlistLoading(true);
    try {
      const wishlistRef = collection(db, 'wishlist');
      const q = query(wishlistRef, where('userId', '==', user.email), where('productId', '==', productId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        Alert.alert('Info', 'This product is already in your wishlist.');
        return;
      }

      const wishlistItem = {
        userId: user.email,
        productId,
        name: product?.name || 'Unnamed Product',
        price: product?.price || 'N/A',
        imageUrl: product?.images?.[0] || '',
        addedAt: new Date(),
      };

      await saveDocument('wishlist', wishlistItem);
      Alert.alert('Success', 'Product added to wishlist.');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      Alert.alert('Error', 'Failed to add product to wishlist.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      Alert.alert('Error', 'You need to log in to contact the seller.');
      return;
    }

    navigation.navigate('Chat', {
      conversationId: `${user.email}_${product?.sellerId}_${productId}`,
      recipient: product?.sellerId,
      productId,
    });
  };

  const handleReport = () => {
    if (!user) {
      Alert.alert('Error', 'You need to log in to report an item.');
      return;
    }

    navigation.navigate('ReportScreen', { productId });
  };

  const handleTryOn = () => {
    navigation.navigate('TryOnScreen', { productId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#c2185b" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Horizontal ScrollView for multiple images */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageCarousel}>
  {(product?.images || [product?.imageUrl])?.map((imageUri: string, index: number) => (
    imageUri && (
      <Image
        key={index}
        source={{ uri: imageUri }}
        style={styles.productImage}
      />
    )
  ))}
</ScrollView>


          <View style={styles.details}>
  <Text style={styles.title}>{product?.name || 'Unnamed Product'}</Text>
  <Text style={styles.price}>RM {product?.price || 'N/A'}</Text>
  <Text style={styles.stock}>
    {product?.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
  </Text>
  <Text style={styles.category}>
    Category: {product?.category || 'No category specified'}
  </Text>
  <Text style={styles.description}>
    {product?.description || 'No description available.'}
  </Text>
</View>


          {seller && (
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerLabel}>Seller:</Text>
              <Text style={styles.sellerName}>{seller.name || 'Unknown Seller'}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionButton, wishlistLoading && styles.disabledButton]}
            onPress={addToWishlist}
            disabled={wishlistLoading}
          >
            <Text style={styles.buttonText}>{wishlistLoading ? 'Adding...' : 'Add to Wishlist'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.buyNowButton]}
            onPress={handleBuyNow}
          >
            <Text style={styles.buttonText}>Buy Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.reportButton]}
            onPress={handleReport}
          >
            <Text style={styles.buttonText}>Report Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.tryOnButton]}
            onPress={handleTryOn}
          >
            <Text style={styles.buttonText}>Virtual Try-On</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  loader: { marginTop: 20 },
  scrollContent: { padding: 20 },
  backButton: { marginBottom: 10 },
  backButtonText: {
    fontSize: 16,
    color: '#c2185b',
    fontWeight: 'bold',
  },
  imageCarousel: {
    marginBottom: 20,
  },
  productImage: {
    width: width - 40,
    height: 250,
    borderRadius: 15,
    marginRight: 10,
  },
  details: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#c2185b', marginBottom: 10 },
  price: { fontSize: 20, color: '#2ecc71', marginBottom: 10 },
  stock: { fontSize: 16, color: '#555', marginBottom: 10 },
  category: {
  fontSize: 16,
  color: '#555',
  marginBottom: 10,
  fontWeight: 'bold',
},
  description: { fontSize: 16, color: '#333' },
  sellerInfo: {
    marginVertical: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sellerLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  sellerName: { fontSize: 16, color: '#555' },
  actionButton: {
    backgroundColor: '#c2185b',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 10,
  },
  buyNowButton: { backgroundColor: '#28a745' },
  reportButton: { backgroundColor: '#f44336' },
  tryOnButton: { backgroundColor: '#007bff' },
  disabledButton: { backgroundColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default ProductDetailScreen;
