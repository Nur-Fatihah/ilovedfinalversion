import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { db } from '../../firebase-config';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const WishlistScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthContext();
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = async () => {
    if (!user) {
      Alert.alert('Error', 'You need to log in to view your wishlist.');
      return;
    }
    setLoading(true);
    try {
      const wishlistRef = collection(db, 'wishlist');
      const q = query(wishlistRef, where('userId', '==', user.email));
      const snapshot = await getDocs(q);

      const wishlistItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlist(wishlistItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      Alert.alert('Error', 'Failed to fetch wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshWishlist = async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const removeFromWishlist = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, 'wishlist', itemId));
      setWishlist((prev) => prev.filter((item) => item.id !== itemId));
      Alert.alert('Success', 'Item removed from wishlist.');
    } catch (error) {
      console.error('Error removing item from wishlist:', error);
      Alert.alert('Error', 'Failed to remove item from wishlist.');
    }
  };

  const renderWishlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.productId })}
    >
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>RM {item.price.toFixed(2)}</Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() =>
            Alert.alert('Confirm Remove', 'Are you sure you want to remove this item?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', onPress: () => removeFromWishlist(item.id) },
            ])
          }
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../assets/iLovedLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Your Wishlist</Text>
      </View>

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#c2185b" style={styles.loader} />
        ) : (
          <FlatList
            data={wishlist}
            keyExtractor={(item) => item.id}
            renderItem={renderWishlistItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshWishlist} />}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>Your wishlist is empty.</Text>}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#ffeef2',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c2185b',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    width: (width - 40) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    marginHorizontal: 5,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  price: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  },
});

export default WishlistScreen;
