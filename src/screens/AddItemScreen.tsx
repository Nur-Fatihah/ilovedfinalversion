import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Updated import
import * as ImagePicker from 'expo-image-picker';
import { saveDocument, uploadImage } from '../../firebase-config';
import { useAuthContext } from '../context/AuthContext';

const AddItemScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthContext();
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState(''); // New state for category
  const [images, setImages] = useState<string[]>([]);
  const [validationError, setValidationError] = useState('');

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImages = result.assets?.map((asset) => asset.uri) || [];
        setImages([...images, ...selectedImages]);
        setValidationError('');
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    }
  };

  const validateInputs = () => {
    if (!itemName.trim() || !itemPrice.trim() || !itemDescription.trim() || !category || images.length === 0 || !stock) {
      setValidationError('Please fill in all fields and add at least one photo.');
      return false;
    }
    if (isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) {
      setValidationError('Please enter a valid price.');
      return false;
    }
    if (isNaN(Number(stock)) || Number(stock) < 0) {
      setValidationError('Please enter a valid stock quantity.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleAddItem = async () => {
    if (!validateInputs()) return;

    try {
      const imageUrls = await Promise.all(
        images.map(async (uri) => {
          const response = await fetch(uri);
          if (!response.ok) {
            throw new Error('Failed to fetch one of the images. Please try again.');
          }
          const blob = await response.blob();
          return uploadImage(blob, `product_images/${user?.uid}_${Date.now()}`);
        })
      );

      const productData = {
        name: itemName.trim(),
        price: parseFloat(itemPrice),
        description: itemDescription.trim(),
        stock: parseInt(stock),
        category, // Include category in product data
        images: imageUrls,
        sellerId: user?.uid || '',
        createdAt: new Date().toISOString(),
      };

      await saveDocument('products', productData);
      Alert.alert('Success', 'Your item has been added successfully!');
      navigation.navigate('SellerDashboard');
    } catch (error) {
      console.error('Error adding item:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to add the item. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Add New Item</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item name"
              value={itemName}
              onChangeText={setItemName}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Price (RM)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter item price"
              keyboardType="numeric"
              value={itemPrice}
              onChangeText={setItemPrice}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Enter item description"
              value={itemDescription}
              onChangeText={setItemDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={category}
                onValueChange={(value) => setCategory(value)}
                style={styles.picker}
              >
                <Picker.Item label="Select Category" value="" />
                <Picker.Item label="Clothing" value="clothing" />
                <Picker.Item label="Electronics" value="electronics" />
                <Picker.Item label="Furniture" value="furniture" />
                <Picker.Item label="Books" value="books" />
                <Picker.Item label="Accessories" value="accessories" />
              </Picker>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter stock quantity"
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>

          <TouchableOpacity style={styles.photoPicker} onPress={handlePickImages}>
            <Text style={styles.photoPickerText}>
              {images.length > 0 ? 'Add More Photos' : 'Add Item Photos'}
            </Text>
          </TouchableOpacity>
          <ScrollView horizontal>
            {images.map((imageUri, index) => (
              <Image key={index} source={{ uri: imageUri }} style={styles.imagePreview} />
            ))}
          </ScrollView>

          {validationError ? <Text style={styles.validationError}>{validationError}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleAddItem}>
            <Text style={styles.buttonText}>Add Item</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9fa' },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: '#c2185b', fontSize: 24, marginRight: 15, fontWeight: 'bold' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#c2185b', textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginVertical: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { padding: 15, borderRadius: 10, borderColor: '#ccc', borderWidth: 1 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10 },
  picker: { height: 50, width: '100%' },
  descriptionInput: { textAlignVertical: 'top' },
  photoPicker: { backgroundColor: '#c2185b', padding: 15, borderRadius: 15, marginVertical: 15 },
  photoPickerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  imagePreview: { width: 100, height: 100, borderRadius: 10, marginHorizontal: 5 },
  validationError: { color: '#e74c3c', fontSize: 14, textAlign: 'center' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 15, marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});

export default AddItemScreen;
