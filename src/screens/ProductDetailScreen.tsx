import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { db, saveDocument } from '../../firebase-config';
import { doc, getDoc, collection, query, where, getDocs,addDoc } from 'firebase/firestore';
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
        imageUrl: product?.imageUrl || '',
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



  const handleBuyNow = async () => {
    if (!user) {
      // If the user is not logged in, navigate to the login screen
      navigation.navigate('Login');
      return;
    }
  
    // Ensure that the product and its sellerId are available
    if (!product?.sellerId || !productId) {
      return; // Do nothing if the product or sellerId is missing
    }
  
    // Generate a unique conversation ID based on buyer and seller details
    const conversationId = `${user.email}_${product.sellerId}_${productId}`;
    
    try {
      // Query the 'users' collection to find the seller by userId
      const usersQuery = query(
        collection(db, 'users'),
        where('userId', '==', product.sellerId) // Find user by sellerId
      );
  
      const usersSnapshot = await getDocs(usersQuery);
      let sellerEmail = '';
      
      if (!usersSnapshot.empty) {
        // Get the seller email from the first matching user document
        const sellerDoc = usersSnapshot.docs[0]; 
        sellerEmail = sellerDoc.data().email; // Assume email field is available
      } else {
        return; // Return if no seller details are found
      }
  
      // Query the 'messages' collection to check if a conversation already exists
      const messagesQuery = query(
        collection(db, 'messages'),
        where('buyer_id', '==', user.email),
        where('seller_id', '==', sellerEmail),
        where('productId', '==', productId)
      );
  
      const messagesSnapshot = await getDocs(messagesQuery);
  
      // If a message conversation already exists, navigate to the existing chat
      if (!messagesSnapshot.empty) {
        const existingConversation = messagesSnapshot.docs[0].data();
        navigation.navigate('Chat', {
          conversationId: existingConversation.conversationId,
          recipient: sellerEmail, // Use the seller's email as recipient
          productId,
        });
        return; // Exit the function as we are navigating to the existing chat
      }
  
      // Add the new message document to the Firestore messages collection
      await addDoc(collection(db, 'messages'), {
        conversationId,
        buyer_id: user.email, // Buyer is the current user
        seller_id: sellerEmail, // Seller email from the 'users' collection
        lastMessage: 'Hi, I am interested in your product!', // Initial message (can be customized)
        productId, // The product involved in the conversation
        createdAt: new Date(), // Timestamp when the message is created
      });
  
      // Navigate to the new Chat screen with the conversationId and seller details
      navigation.navigate('Chat', {
        conversationId,
        recipient: sellerEmail, // Use the seller's email as recipient
        productId,
      });
    } catch (error) {
      console.error('Error creating message conversation:', error);
    }
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
          <Image
            source={{ uri: product?.imageUrl || 'https://via.placeholder.com/150' }}
            style={styles.productImage}
          />
          <View style={styles.details}>
            <Text style={styles.title}>{product?.name || 'Unnamed Product'}</Text>
            <Text style={styles.price}>RM {product?.price || 'N/A'}</Text>
            <Text style={styles.stock}>
              {product?.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
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
  productImage: {
    width: width - 40,
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  details: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#c2185b', marginBottom: 10 },
  price: { fontSize: 20, color: '#2ecc71', marginBottom: 10 },
  stock: { fontSize: 16, color: '#555', marginBottom: 10 },
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
