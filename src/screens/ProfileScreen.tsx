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
  TextInput,
} from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { db, storage } from '../../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProfileScreenProps {
  navigation: any;
  setIsSellerMode: (value: boolean) => void; // Add this prop to handle mode change
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation, setIsSellerMode }) => {
  const { user, signOut } = useAuthContext();
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const fetchUserData = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'No user data found.');
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setName(data.name || '');
        setProfilePicture(data.profilePicture || '');
      } else {
        Alert.alert('Error', 'User data not found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user?.uid) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name,
        profilePicture,
      });

      setUserData({ ...userData, name, profilePicture });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handlePickImage = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      try {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        setProfilePicture(downloadURL);

        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { profilePicture: downloadURL });

        Alert.alert('Success', 'Profile picture updated!');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload profile picture.');
      }
    }
  };

  const handleLogout = () => {
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
        <Text style={styles.headerText}>Your Profile</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#c2185b" style={styles.loader} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.profilePictureWrapper}>
              <Image
                source={{
                  uri: profilePicture || 'https://via.placeholder.com/150',
                }}
                style={styles.profilePicture}
              />
              {editing && (
                <TouchableOpacity style={styles.editIcon} onPress={handlePickImage}>
                  <Text style={styles.editIconText}>✏️</Text>
                </TouchableOpacity>
              )}
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
            ) : (
              <>
                <Text style={styles.userName}>{name || 'User Name'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'User Email'}</Text>
              </>
            )}
            <Text style={styles.accountStatus}>
              {userData?.isSeller ? 'Seller Account' : 'Buyer Account'}
            </Text>
          </View>

          {editing ? (
            <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          ) : (
            <>
              {!userData?.isSeller && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setIsSellerMode(true); // Handle switching to seller mode
                    navigation.navigate('SellerTabs');
                  }}
                >
                  <Text style={styles.buttonText}>Become a Seller</Text>
                </TouchableOpacity>
              )}
              {userData?.isSeller && (
                <TouchableOpacity
                  style={[styles.button, styles.sellerDashboardButton]}
                  onPress={() => navigation.navigate('SellerTabs')}
                >
                  <Text style={styles.buttonText}>Go to Seller Dashboard</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setEditing(!editing)}>
            <Text style={styles.buttonText}>{editing ? 'Cancel' : 'Edit Profile'}</Text>
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
  profilePictureWrapper: {
    position: 'relative',
  },
  profilePicture: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 5,
    elevation: 3,
  },
  editIconText: {
    fontSize: 16,
    color: '#c2185b',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  accountStatus: {
    fontSize: 14,
    color: '#2ecc71',
    fontWeight: '700',
  },
  input: {
    width: '90%',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#c2185b',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: '#ffa726',
  },
  sellerDashboardButton: {
    backgroundColor: '#28a745',
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

export default ProfileScreen;
