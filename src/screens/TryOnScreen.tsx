import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import tw from 'twrnc';
import axios from 'axios';
import { encode } from 'base64-arraybuffer';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const REMOVE_BG_API_KEY = 'hRoP4a4HTRfNmvgKobyYoRgn'; // Replace with your actual API key

const TryOnScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { productId } = route.params;
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null); // New state for the original image
  const [loading, setLoading] = useState(true);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const baseTranslateX = useSharedValue(0); // Base X position
  const baseTranslateY = useSharedValue(0); // Base Y position
  const scale = useSharedValue(1); // Current scale
  const baseScale = useSharedValue(1); // Base scale to maintain after resizing
  const rotation = useSharedValue(0); // Rotation for the loading animation
  const pulseScale = useSharedValue(1); // Scale for the loading animation

  const fetchProductImage = async () => {
    setLoading(true);
    try {
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const image = productSnap.data().images?.[0] || null;

        if (image) {
          setOriginalImage(image); // Set the original image before processing
          const bgRemovedImage = await removeBackground(image);
          setProductImage(bgRemovedImage);
        } else {
          setProductImage(null);
        }
      } else {
        Alert.alert('Error', 'Product not found.');
      }
    } catch (error) {
      console.error('Error fetching product image:', error);
      Alert.alert('Error', 'Failed to fetch product details.');
    } finally {
      setLoading(false);
    }
  };

  const removeBackground = async (imageUrl: string): Promise<string | null> => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.remove.bg/v1.0/removebg',
        {
          image_url: imageUrl,
        },
        {
          headers: {
            'X-Api-Key': REMOVE_BG_API_KEY,
          },
          responseType: 'arraybuffer', // Ensure binary data is returned
        }
      );

      if (response.status === 200) {
        const base64Image = `data:image/png;base64,${encode(response.data)}`;
        return base64Image;
      } else {
        Alert.alert('Error', 'Failed to remove background.');
        return null;
      }
    } catch (error) {
      console.error('Error removing background:', error);
      Alert.alert('Error', 'Failed to remove background from image.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductImage();

    // Start loading animation
    rotation.value = withRepeat(withTiming(360, { duration: 2000, easing: Easing.linear }), -1);
    pulseScale.value = withRepeat(
      withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [productId]);

  const handleUploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setUploadedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload the photo. Please try again.');
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = baseTranslateX.value + event.translationX;
      translateY.value = baseTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      baseTranslateX.value = translateX.value;
      baseTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = baseScale.value * event.scale;
    })
    .onEnd(() => {
      baseScale.value = scale.value;
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const loadingImageStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: pulseScale.value },
    ],
  }));

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`p-5 bg-pink-200 flex-row items-center justify-between`}>
        <TouchableOpacity style={tw`mr-4`} onPress={() => navigation.goBack()}>
          <Text style={tw`text-lg text-pink-800`}>← Back</Text>
        </TouchableOpacity>
        <Text style={tw`text-lg text-pink-800`}>Virtual Try-On</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-5 items-center`}>
        {uploadedPhoto ? (
          <Image source={{ uri: uploadedPhoto }} style={tw`w-72 h-72 rounded-lg mb-5`} />
        ) : (
          <View style={tw`w-72 h-72 bg-gray-300 justify-center items-center rounded-lg mb-5`}>
            <Text style={tw`text-gray-500 text-lg`}>No photo uploaded</Text>
          </View>
        )}

        <TouchableOpacity
          style={tw`bg-blue-500 p-4 rounded-lg items-center mb-5`}
          onPress={handleUploadPhoto}
        >
          <Text style={tw`text-white font-bold text-lg`}>
            {uploadedPhoto ? 'Change Photo' : 'Upload Photo'}
          </Text>
        </TouchableOpacity>

        {productImage && (
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[animatedStyle, tw`w-72 h-72 mb-5`]}>
              <Image
                source={{ uri: productImage }}
                style={tw`w-full h-full rounded-lg`}
                resizeMode="contain"
              />
            </Animated.View>
          </GestureDetector>
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          {originalImage ? (
            <Animated.Image
              source={{ uri: originalImage || undefined }}
              style={[tw`w-48 h-48 rounded-full`, loadingImageStyle]}
            />
          ) : (
            <Animated.View style={[tw`w-48 h-48 bg-gray-300 rounded-full`, loadingImageStyle]} />
          )}
          <Text style={styles.loadingText}>Analyzing Image...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TryOnScreen;
