import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../firebase-config';
import { useAuthContext } from '../context/AuthContext';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { conversationId, recipient } = route.params;
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('Seller');

  useEffect(() => {
    // Fetch recipient's name
    const fetchRecipientName = async () => {
      try {
        const recipientRef = doc(db, 'users', recipient);
        const recipientSnap = await getDoc(recipientRef);
        if (recipientSnap.exists()) {
          const data = recipientSnap.data();
          setRecipientName(data.name || 'Seller');
        }
      } catch (error) {
        console.error('Error fetching recipient name:', error);
      }
    };

    fetchRecipientName();
  }, [recipient]);

  useEffect(() => {
    if (!conversationId) return;

    const messagesQuery = query(
      collection(db, `messages/${conversationId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    await addDoc(collection(db, `messages/${conversationId}/messages`), {
      senderId: user?.email,
      text: newMessage.trim(),
      createdAt: serverTimestamp(),
    });

    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.senderId === user?.email ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>{recipientName}</Text>
        </View>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#ffeef2',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backText: { fontSize: 18, color: '#c2185b', marginRight: 10 },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#c2185b' },
  container: { flex: 1 },
  chatContainer: { padding: 10 },
  message: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#ffeef2', color: '#fff' },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#f1f1f1' },
  messageText: { fontSize: 14, color: '#333' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#c2185b',
  },
  sendButtonText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },
});

export default ChatScreen;
