import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Dimensions,
} from 'react-native';
import { db } from '../../firebase-config';
import { collection, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = ['All', 'Clothing', 'Footwear', 'Headwear', 'Accessories', 'Beauty', 'Electronics', 'Furniture', 'Books', 'Foods', 'Others'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const snapshot = await getDocs(productsRef);

      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      setRefreshing(true);
      await fetchProducts();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (text: string) => {
    setSearchText(text);
    filterProducts(text, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterProducts(searchText, category);
  };

  const filterProducts = (text: string, category: string) => {
    let filtered = products;

    if (text) {
      filtered = filtered.filter((product) =>
        product.name?.toLowerCase().includes(text.toLowerCase())
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((product) => product.category === category);
    }

    setFilteredProducts(filtered);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetailScreen', { productId: item.id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} // Use the first image in the array
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name || 'Unnamed Product'}</Text>
        <Text style={styles.productCategory}>{item.category || 'Uncategorized'}</Text>
        <Text style={styles.productPrice}>RM {item.price || 'N/A'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../assets/iLovedLogo.png')} style={styles.logo} />
        <Text style={styles.welcomeText}>Welcome to iLoved!</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Search for products..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#888"
        />
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected,
              ]}
              onPress={() => handleCategoryChange(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.productContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#c2185b" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            numColumns={2}
            columnWrapperStyle={styles.row}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refreshProducts} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>No products available. Try again later!</Text>
            }
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
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#c2185b',
    marginBottom: 10,
  },
  searchBar: {
    width: '90%',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 14,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categoryButtonSelected: {
    backgroundColor: '#c2185b',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  productContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
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
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 10,
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default HomeScreen;
