import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase-config';
import { useAuthContext } from '../context/AuthContext';
import tw from 'twrnc';

// Define a type for the Message object
interface Message {
  senderId: string;
  text: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

const ChatScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { conversationId, recipient } = route.params;
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientName, setRecipientName] = useState('Seller');
  const [loading, setLoading] = useState(false);

  // Fetch recipient name
  useEffect(() => {
    const fetchRecipientName = async () => {
      try {
        const recipientQuery = query(
          collection(db, 'users'),
          where('email', '==', recipient)
        );
        const recipientSnap = await getDocs(recipientQuery);

        if (!recipientSnap.empty) {
          const data = recipientSnap.docs[0].data();
          setRecipientName(data.name || 'Seller');
        } else {
          setRecipientName('Seller');
        }
      } catch (error) {
        console.error('Error fetching recipient name:', error);
      }
    };

    fetchRecipientName();
  }, [recipient]);

  // Fetch messages from Firestore
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const conversationRef = doc(db, 'messages', conversationId);
        const conversationSnap = await getDoc(conversationRef);

        if (conversationSnap.exists()) {
          const data = conversationSnap.data();
          setMessages(data.convert || []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    const unsubscribe = onSnapshot(
      doc(db, 'messages', conversationId),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setMessages(data.convert || []);
        }
      }
    );

    return () => unsubscribe();
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
  
    setLoading(true);
  
    const newMessageData: Message = {
      senderId: user?.email || '',
      text: newMessage.trim(),
      createdAt: {
        seconds: Math.floor(new Date().getTime() / 1000),
        nanoseconds: 0,
      },
    };
  
    try {
      const conversationRef = doc(db, 'messages', conversationId);
      const conversationSnap = await getDoc(conversationRef);
  
      if (conversationSnap.exists()) {
        const currentData = conversationSnap.data();
        const updatedMessages = [...(currentData.convert || []), newMessageData];
  
        // Update Firestore with the new message
        await updateDoc(conversationRef, {
          convert: updatedMessages,
          lastMessage: newMessage.trim(),
        });
  
        // Clear the textbox
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const renderMessage = ({ item }: { item: Message }) => {
    const formattedDate = item.createdAt
      ? new Date(item.createdAt.seconds * 1000).toLocaleString()
      : 'Unknown time';

    const isCurrentUser = item.senderId === user?.email;

    return (
      <View
        style={[
          tw`p-3 rounded-lg my-2 max-w-3/4`,
          isCurrentUser ? tw`bg-pink-100 self-end` : tw`bg-gray-200 self-start`,
        ]}
      >
        <Text style={tw`text-gray-800 text-sm`}>{item.text}</Text>
        <Text style={tw`text-gray-500 text-xs`}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={tw`bg-pink-100 p-5 flex-row items-center shadow-md`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={tw`text-pink-700 text-lg mr-2`}>←</Text>
          </TouchableOpacity>
          <Text style={tw`text-pink-700 text-lg font-bold`}>{recipientName}</Text>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={tw`p-2`}
          ListEmptyComponent={
            <Text style={tw`text-center text-gray-500`}>No messages yet</Text>
          }
        />

        {/* Input */}
        <View style={tw`flex-row items-center p-3 border-t border-gray-300 bg-white`}>
          <TextInput
            style={tw`flex-1 p-3 rounded-full bg-gray-200 text-sm text-gray-800`}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            editable={!loading}
          />
          <TouchableOpacity
            style={tw`ml-3 p-3 rounded-full ${
              loading ? 'bg-gray-400' : 'bg-pink-700'
            }`}
            onPress={handleSendMessage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={tw`text-white text-sm font-bold`}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
