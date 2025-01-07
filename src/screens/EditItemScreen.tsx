import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateDocument, uploadImage, deleteDocument } from '../../firebase-config';

const EditItemScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { product } = route.params;
  const [itemName, setItemName] = useState(product.name);
  const [itemPrice, setItemPrice] = useState(product.price.toString());
  const [itemDescription, setItemDescription] = useState(product.description);
  const [stock, setStock] = useState(product.stock.toString());
  const [imageUri, setImageUri] = useState(product.imageUrl || '');
  const [category, setCategory] = useState(product.category || '');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const validateInputs = () => {
    if (!itemName.trim() || !itemPrice.trim() || !itemDescription.trim() || !stock.trim() || !category) {
      Alert.alert('Error', 'Please fill in all fields.');
      return false;
    }
    if (isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) {
      Alert.alert('Error', 'Please enter a valid price.');
      return false;
    }
    if (isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert('Error', 'Please enter a valid stock quantity.');
      return false;
    }
    return true;
  };

  const handleUpdateItem = async () => {
    if (!validateInputs()) return;

    try {
      let updatedImageUrl = imageUri;

      if (imageUri !== product.imageUrl) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        updatedImageUrl = await uploadImage(blob, `product_images/${product.id}`);
      }

      const updatedData = {
        name: itemName,
        price: parseFloat(itemPrice),
        description: itemDescription,
        stock: parseInt(stock, 10),
        category,
        imageUrl: updatedImageUrl,
      };

      await updateDocument('products', product.id, updatedData);
      Alert.alert('Success', 'Product updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  const handleDeleteItem = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDocument('products', product.id);
              Alert.alert('Success', 'Product deleted successfully.');
              navigation.goBack();
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

  const renderCategoryDropdown = () => (
    <View style={styles.dropdown}>
      {['Clothing', 'Footwear','Headwear', 'Accessories', 'Beauty','Electronics', 'Furniture', 'Books', 'Foods', 'Others'].map((cat) => (
        <TouchableOpacity
          key={cat}
          style={styles.dropdownItem}
          onPress={() => {
            setCategory(cat);
            setShowCategoryDropdown(false);
          }}
        >
          <Text style={styles.dropdownText}>{cat}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffeef2' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Item</Text>

        <TextInput
          style={styles.input}
          placeholder="Item Name"
          value={itemName}
          onChangeText={setItemName}
        />

        <TextInput
          style={styles.input}
          placeholder="Item Price"
          keyboardType="numeric"
          value={itemPrice}
          onChangeText={setItemPrice}
        />

        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Item Description"
          value={itemDescription}
          onChangeText={setItemDescription}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.input}
          placeholder="Stock Quantity"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        <TouchableOpacity
          style={styles.dropdownToggle}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
        >
          <Text style={styles.dropdownToggleText}>
            {category || 'Select Category'}
          </Text>
        </TouchableOpacity>
        {showCategoryDropdown && renderCategoryDropdown()}

        <TouchableOpacity style={styles.photoPicker} onPress={handlePickImage}>
          <Text style={styles.photoPickerText}>
            {imageUri ? 'Change Product Image' : 'Add Product Image'}
          </Text>
        </TouchableOpacity>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

        <TouchableOpacity style={styles.button} onPress={handleUpdateItem}>
          <Text style={styles.buttonText}>Update Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#e74c3c' }]}
          onPress={handleDeleteItem}
        >
          <Text style={styles.buttonText}>Delete Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  backButton: { marginBottom: 10 },
  backButtonText: { fontSize: 16, color: '#c2185b', fontWeight: 'bold' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#c2185b', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginVertical: 10 },
  descriptionInput: { textAlignVertical: 'top' },
  dropdownToggle: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginVertical: 10 },
  dropdownToggleText: { color: '#555' },
  dropdown: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 10 },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  dropdownText: { color: '#333' },
  photoPicker: { backgroundColor: '#c2185b', padding: 15, borderRadius: 10, marginVertical: 15 },
  photoPickerText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  imagePreview: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});

export default EditItemScreen;
