import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { db } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';

const SellerProfileScreen = ({
  navigation,
  setIsSellerMode,
}: {
  navigation: any;
  setIsSellerMode: (value: boolean) => void;
}) => {
  const { user, signOut } = useAuthContext();
  const [sellerData, setSellerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSellerData = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'No user data found.');
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setSellerData(docSnap.data());
      } else {
        Alert.alert('Error', 'Seller data not found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load seller data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            await signOut();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (error) {
            Alert.alert('Error', 'Failed to log out.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../assets/iLovedLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Seller Profile</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c2185b" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <Image
              source={{
                uri: sellerData?.profilePicture || 'https://via.placeholder.com/150',
              }}
              style={styles.profilePicture}
            />
            <Text style={styles.name}>{sellerData?.name || 'Seller Name'}</Text>
            <Text style={styles.email}>{sellerData?.email || 'Seller Email'}</Text>
            <Text style={styles.status}>
              {sellerData?.rating ? `${sellerData.rating} ★` : 'No ratings yet'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.switchModeButton]}
            onPress={() => {
              setIsSellerMode(false);
              navigation.replace('BuyerTabs');
            }}
          >
            <Text style={styles.buttonText}>Switch to Buyer Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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
  loader: {
    marginTop: 20,
  },
  content: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#c2185b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  switchModeButton: {
    backgroundColor: '#007bff',
  },
  logoutButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SellerProfileScreen;
