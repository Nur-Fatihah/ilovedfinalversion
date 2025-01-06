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
import { updateDocument, uploadImage } from '../../firebase-config';

const EditItemScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { product } = route.params; // Receive product data
  const [itemName, setItemName] = useState(product.name);
  const [itemPrice, setItemPrice] = useState(product.price.toString());
  const [itemDescription, setItemDescription] = useState(product.description);
  const [stock, setStock] = useState(product.stock.toString());
  const [imageUri, setImageUri] = useState(product.imageUrl || '');
  const [virtualTryOnModel, setVirtualTryOnModel] = useState(product.virtualTryOnModel || '');

  const handlePickImage = async (setImage: React.Dispatch<React.SetStateAction<string>>) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        const uri = result.assets[0].uri;
        setImage(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const validateInputs = () => {
    if (!itemName.trim() || !itemPrice.trim() || !itemDescription.trim() || !stock.trim()) {
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
      let updatedVirtualTryOnModel = virtualTryOnModel;

      if (imageUri !== product.imageUrl) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        updatedImageUrl = await uploadImage(blob, `product_images/${product.id}`);
      }

      if (virtualTryOnModel && virtualTryOnModel !== product.virtualTryOnModel) {
        const response = await fetch(virtualTryOnModel);
        const blob = await response.blob();
        updatedVirtualTryOnModel = await uploadImage(blob, `virtual_try_on/${product.id}`);
      }

      const updatedData = {
        name: itemName,
        price: parseFloat(itemPrice),
        description: itemDescription,
        stock: parseInt(stock, 10),
        imageUrl: updatedImageUrl,
        virtualTryOnModel: updatedVirtualTryOnModel,
      };

      await updateDocument('products', product.id, updatedData);
      Alert.alert('Success', 'Product updated successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffeef2' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerText}>Edit Item</Text>

        {/* Item Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Item Name"
          value={itemName}
          onChangeText={setItemName}
        />

        {/* Item Price Input */}
        <TextInput
          style={styles.input}
          placeholder="Item Price"
          keyboardType="numeric"
          value={itemPrice}
          onChangeText={setItemPrice}
        />

        {/* Item Description Input */}
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Item Description"
          value={itemDescription}
          onChangeText={setItemDescription}
          multiline
          numberOfLines={4}
        />

        {/* Stock Quantity Input */}
        <TextInput
          style={styles.input}
          placeholder="Stock Quantity"
          keyboardType="numeric"
          value={stock}
          onChangeText={setStock}
        />

        {/* Product Image Picker */}
        <TouchableOpacity
          style={styles.photoPicker}
          onPress={() => handlePickImage(setImageUri)}
        >
          <Text style={styles.photoPickerText}>
            {imageUri ? 'Change Product Image' : 'Add Product Image'}
          </Text>
        </TouchableOpacity>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

        {/* Virtual Try-On Model Picker */}
        <TouchableOpacity
          style={styles.photoPicker}
          onPress={() => handlePickImage(setVirtualTryOnModel)}
        >
          <Text style={styles.photoPickerText}>
            {virtualTryOnModel ? 'Change Virtual Try-On Model' : 'Add Virtual Try-On Model'}
          </Text>
        </TouchableOpacity>
        {virtualTryOnModel && (
          <Image source={{ uri: virtualTryOnModel }} style={styles.imagePreview} />
        )}

        {/* Update Button */}
        <TouchableOpacity style={styles.button} onPress={handleUpdateItem}>
          <Text style={styles.buttonText}>Update Item</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 10,
    
  },
  backButtonText: {
    fontSize: 16,
    color: '#c2185b',
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c2185b',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  descriptionInput: {
    textAlignVertical: 'top',
  },
  photoPicker: {
    backgroundColor: '#c2185b',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  photoPickerText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EditItemScreen;
