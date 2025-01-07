import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { db, deleteDocument } from '../../firebase-config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const SellerDashboardScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthContext();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    if (!user) {
      Alert.alert('Error', 'User not logged in');
      setLoading(false);
      return;
    }

    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('sellerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
      setLoading(false);
    });

    return () => unsubscribe();
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDocument('products', productId);
              Alert.alert('Success', 'Product deleted successfully.');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderProduct = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{item.name || 'Unnamed Product'}</Text>
        <Text style={styles.productPrice}>RM {item.price || 'N/A'}</Text>
        {item.stock === 0 && (
          <Text style={styles.outOfStockBadge}>Out of Stock</Text>
        )}
        <Text style={styles.productStock}>Stock: {item.stock || 0}</Text>
      </View>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditItem', { product: item })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../assets/iLovedLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Your Seller Dashboard</Text>
      </View>

      <Text style={styles.subtitle}>Your Listings</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#c2185b" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You have not added any products. Start by adding one!
              </Text>
            </View>
          }
        />
      )}

      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddItem')}
        >
          <Text style={styles.addButtonText}>Add New Item</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { backgroundColor: '#ffeef2', padding: 20, alignItems: 'center' },
  logo: { width: 60, height: 60, marginBottom: 10 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#c2185b' },
  subtitle: { paddingHorizontal: 20, marginVertical: 10, fontSize: 18, fontWeight: 'bold' },
  loader: { marginTop: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: 15 },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    width: (width - 60) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: { width: '100%', height: 120, borderRadius: 10, marginBottom: 10 },
  productDetails: { alignItems: 'center', marginBottom: 10 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  productPrice: { fontSize: 14, color: 'green' },
  outOfStockBadge: { marginTop: 5, fontSize: 12, color: '#e74c3c', fontWeight: 'bold' },
  productStock: { fontSize: 14, color: '#555' },
  buttonGroup: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  editButton: { backgroundColor: '#3498db', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 5 },
  editButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  deleteButton: { backgroundColor: '#e74c3c', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 5 },
  deleteButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { fontSize: 16, color: '#888', textAlign: 'center' },
  addButtonContainer: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  addButton: { backgroundColor: '#c2185b', padding: 15, borderRadius: 15, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default SellerDashboardScreen;
