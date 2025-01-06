import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { loginUser, getDocument, sendResetEmail } from '../../firebase-config';
import { useAuthContext } from '../context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setIsAuthenticated, setUser } = useAuthContext();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);

      if (user) {
        if (!user.emailVerified) {
          Alert.alert(
            'Email Verification Required',
            'Please verify your email. A verification link has been sent.',
            [
              {
                text: 'Resend Email',
                onPress: async () => {
                  try {
                    await sendEmailVerification(user);
                    Alert.alert('Success', 'Verification email sent. Please check your inbox.');
                  } catch (error) {
                    console.error('Error sending email verification:', error);
                    Alert.alert('Error', 'Failed to send verification email.');
                  }
                },
              },
              { text: 'OK', style: 'cancel' },
            ]
          );
          return;
        }

        const userData = await getDocument('users', user.uid);
        if (userData) {
          setUser({
            name: userData.name,
            email: userData.email || user.email,
            uid: user.uid,
          });
          setIsAuthenticated(true);
          navigation.replace(userData.isSeller ? 'SellerTabs' : 'BuyerTabs');
        } else {
          Alert.alert('Error', 'User data not found.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email to reset your password.');
      return;
    }

    try {
      await sendResetEmail(email);
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Error sending reset email:', error);
      Alert.alert('Error', 'Failed to send password reset email.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image
            source={require('../../assets/iLovedLogo.png')}
            style={styles.logo}
          />
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="IIUM Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Don’t have an account? Register</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffeef2',
  },
  scrollContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c2185b',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
  },
  button: {
    backgroundColor: '#c2185b',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    color: '#c2185b',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default LoginScreen;
