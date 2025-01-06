import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCjgEt8MZMXvRD2Od0r-xEn34bWflqq-V8',
  authDomain: 'iloved-92a38.firebaseapp.com',
  projectId: 'iloved-92a38',
  messagingSenderId: '1036524420000',
  appId: '1:1036524420000:web:10a3b1255409572e5ec2c5',
  measurementId: 'G-G0JNRKEM8K',
  storageBucket: 'iloved-92a38.firebasestorage.app'
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper function for error handling
const handleError = (error: any, customMessage: string): never => {
  console.error(`${customMessage}:`, error.message || error);
  console.error('Full Error:', error);
  throw new Error(error.message || customMessage);
};

/**
 * Register a new user with email and password.
 */
const registerUser = async (email: string, password: string): Promise<User | undefined> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User registered successfully:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    handleError(error, 'Error registering user');
  }
  return undefined;
};

/**
 * Login a user with email and password.
 */
const loginUser = async (email: string, password: string): Promise<User | undefined> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User logged in successfully:', userCredential.user.email);
    return userCredential.user;
  } catch (error: any) {
    handleError(error, 'Error logging in');
  }
  return undefined;
};

/**
 * Logout the currently logged-in user.
 */
const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
    console.log('User logged out successfully.');
  } catch (error: any) {
    handleError(error, 'Error logging out');
  }
};

/**
 * Send a password reset email.
 */
const sendResetEmail = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('Password reset email sent successfully.');
  } catch (error: any) {
    handleError(error, 'Error sending password reset email');
  }
};

/**
 * Upload a file to Firebase Storage and return its download URL.
 */
const uploadImage = async (file: Blob, path: string): Promise<string> => {
  try {
    console.log('Uploading to path:', path); // Log the upload path
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Image uploaded successfully. URL:', downloadURL);
    return downloadURL;
  } catch (error: any) {
    handleError(error, 'Error uploading image');
  }
  return '';
};

/**
 * Save a document in Firestore.
 */
const saveDocument = async <T extends Record<string, any>>(
  collectionName: string,
  documentData: T
): Promise<string> => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, documentData);
    console.log('Document saved successfully:', docRef.id);
    return docRef.id;
  } catch (error: any) {
    handleError(error, 'Error saving document');
  }
  return '';
};

/**
 * Fetch a document from Firestore by ID.
 */
const getDocument = async (
  collectionName: string,
  docId: string
): Promise<Record<string, any> | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log('Document fetched successfully:', docSnap.data());
      return docSnap.data();
    }
    console.warn(`No document found for ID: ${docId}`);
    return null;
  } catch (error: any) {
    handleError(error, 'Error fetching document');
  }
  return null;
};

/**
 * Update a document in Firestore.
 */
const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Partial<Record<string, any>>
): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    console.log('Document updated successfully.');
  } catch (error: any) {
    handleError(error, 'Error updating document');
  }
};

/**
 * Delete a document from Firestore.
 */
const deleteDocument = async (collectionName: string, docId: string): Promise<void> => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log('Document deleted successfully.');
  } catch (error: any) {
    handleError(error, 'Error deleting document');
  }
};

/**
 * Query Firestore for documents based on conditions.
 */
const queryDocuments = async (
  collectionName: string,
  filters: Array<{ field: string; operator: Parameters<typeof where>[1]; value: any }>,
  orderByField: string = '',
  orderDirection: 'asc' | 'desc' = 'asc'
): Promise<Record<string, any>[]> => {
  try {
    let q = query(collection(db, collectionName));

    filters.forEach(({ field, operator, value }) => {
      q = query(q, where(field, operator, value));
    });

    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }

    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    console.log('Documents queried successfully.');
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    handleError(error, 'Error querying documents');
  }
  return [];
};

export {
  app,
  auth,
  db,
  storage,
  registerUser,
  loginUser,
  logoutUser,
  sendResetEmail,
  uploadImage,
  saveDocument,
  getDocument,
  updateDocument,
  deleteDocument,
  queryDocuments,
};
