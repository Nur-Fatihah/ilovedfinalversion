import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Switch,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { saveDocument, uploadImage } from '../../firebase-config';
import { useAuthContext } from '../context/AuthContext';

const AddItemScreen = ({ navigation }: { navigation: any }) => {
  const { user } = useAuthContext();
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [stock, setStock] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [virtualTryOnModel, setVirtualTryOnModel] = useState<string | null>(null);
  const [useVirtualTryOn, setUseVirtualTryOn] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handlePickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
        setValidationError('');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick an image. Please try again.');
    }
  };

  const validateInputs = () => {
    if (!itemName.trim() || !itemPrice.trim() || !itemDescription.trim() || !imageUri || !stock) {
      setValidationError('Please fill in all fields and add a photo.');
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
      if (!imageUri) throw new Error('Image URI is invalid. Please select an image.');

      const response = await fetch(imageUri);
      if (!response.ok) {
        throw new Error('Failed to fetch the image. Please try again.');
      }

      const blob = await response.blob();
      const imageUrl = await uploadImage(blob, `product_images/${user?.uid}_${Date.now()}`);

      let virtualTryOnUrl = '';
      if (useVirtualTryOn && virtualTryOnModel) {
        const tryOnResponse = await fetch(virtualTryOnModel);
        if (!tryOnResponse.ok) {
          throw new Error('Failed to fetch the virtual try-on model. Please try again.');
        }
        const tryOnBlob = await tryOnResponse.blob();
        virtualTryOnUrl = await uploadImage(
          tryOnBlob,
          `virtual_try_on/${user?.uid}_${Date.now()}`
        );
      }

      const productData = {
        name: itemName.trim(),
        price: parseFloat(itemPrice),
        description: itemDescription.trim(),
        stock: parseInt(stock),
        imageUrl,
        sellerId: user?.uid || '',
        createdAt: new Date().toISOString(),
        virtualTryOnModel: virtualTryOnUrl || '',
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
            <Text style={styles.label}>Stock Quantity</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter stock quantity"
              keyboardType="numeric"
              value={stock}
              onChangeText={setStock}
            />
          </View>

          <TouchableOpacity
            style={styles.photoPicker}
            onPress={() => handlePickImage(setImageUri)}
          >
            <Text style={styles.photoPickerText}>{imageUri ? 'Change Item Photo' : 'Add Item Photo'}</Text>
          </TouchableOpacity>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

          <View style={styles.card}>
            <Text style={styles.label}>Enable Virtual Try-On</Text>
            <Switch
              value={useVirtualTryOn}
              onValueChange={(value) => {
                setUseVirtualTryOn(value);
                if (!value) setVirtualTryOnModel(null);
              }}
            />
            {useVirtualTryOn && (
              <>
                <TouchableOpacity
                  style={styles.photoPicker}
                  onPress={() => handlePickImage(setVirtualTryOnModel)}
                >
                  <Text style={styles.photoPickerText}>
                    {virtualTryOnModel ? 'Change Try-On Model' : 'Add Try-On Model'}
                  </Text>
                </TouchableOpacity>
                {virtualTryOnModel && (
                  <Image source={{ uri: virtualTryOnModel }} style={styles.imagePreview} />
                )}
              </>
            )}
          </View>

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
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backText: { color: '#c2185b', fontSize: 24, marginRight: 15, fontWeight: 'bold' },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#c2185b', textAlign: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginVertical: 10 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  input: { padding: 15, borderRadius: 10, borderColor: '#ccc', borderWidth: 1 },
  descriptionInput: { textAlignVertical: 'top' },
  photoPicker: { backgroundColor: '#c2185b', padding: 15, borderRadius: 15, marginVertical: 15 },
  photoPickerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  imagePreview: { width: '100%', height: 200, borderRadius: 10, marginVertical: 15 },
  validationError: { color: '#e74c3c', fontSize: 14, textAlign: 'center' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 15, marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});

export default AddItemScreen;
