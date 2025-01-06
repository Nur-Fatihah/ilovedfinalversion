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
} from 'react-native';
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebase-config';
import { useAuthContext } from '../context/AuthContext';
import tw from 'twrnc';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  
}
interface Convert {
  senderId: string;
  text: string;
  createdAt: any;
  buyer_id: string;
  seller_id: string;
  lastMessage: string;
  productId: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  convert: Convert; // The 'convert' field is an object of type Convert
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

  const [loading, setLoading] = useState<boolean>(false); // Loading state

  useEffect(() => {
    const fetchRecipientName = async () => {
      console.log('Fetching recipient name for:', recipient);
      setLoading(true); // Start loading
      try {
        const recipientQuery = query(
          collection(db, 'users'),
          where('email', '==', recipient) // Query by email
        );
        
        const recipientSnap = await getDocs(recipientQuery);

        if (!recipientSnap.empty) {
          const data = recipientSnap.docs[0].data();
          console.log('Recipient data:', data);
          setRecipientName(data.name || 'Seller');
        } else {
          console.log('Recipient not found');
          setRecipientName('Seller'); // Default to 'Seller' if not found
        }
      } catch (error) {
        console.error('Error fetching recipient name:', error);
        setRecipientName('Seller');
      } finally {
        setLoading(false); // Stop loading once the operation is complete
      }
    };

    fetchRecipientName();
  }, [recipient]);
    

  // Fetch messages for the conversation
  useEffect(() => {
    if (!conversationId) return;
  
    // Log the messagesQuery to see what is being created
    const messagesQuery = query(
      collection(db, 'messages'), // Query the `messages` collection directly
      where('conversationId', '==', conversationId), // Filter messages based on conversationId
      orderBy('createdAt', 'asc') // Ensure messages are ordered by the timestamp
    );
  
    console.log('Messages Query:', messagesQuery); // Log the query object to verify it's correct
  
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      // Log the snapshot to inspect the data
      console.log('Snapshot:', snapshot);
  
      const fetchedMessages = snapshot.docs.map((doc) => {
        console.log('Document Data:', doc.data()); // Log document data for each message
        return {
          id: doc.id,
          ...doc.data(),
        };
      }) as Message[];
  
      setMessages(fetchedMessages);
  
      // Log the final array of fetched messages
      console.log('Fetched Messsages:', fetchedMessages);
    });
  
    return () => unsubscribe();
  }, [conversationId]);
  

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
  
    try {
      // Define the new message data with a client-side timestamp
      const newMessageData = {
        senderId: user?.email,
        text: newMessage.trim(),
        createdAt: new Date(), // Use current timestamp instead of serverTimestamp()
      };
  
      // Get the conversation document reference by using conversationId
      const conversationRef = doc(db, 'messages', conversationId);
  
      // Fetch the current conversation document to check if the convert field exists
      const conversationSnap = await getDoc(conversationRef);
      const currentConvert = conversationSnap.exists() ? conversationSnap.data().convert : [];
  
      // If convert field already exists and is an array, append the new message to it
      const updatedConvert = Array.isArray(currentConvert) ? [...currentConvert, newMessageData] : [newMessageData];
  
      // Update the conversation document with the new message inside the convert array
      await updateDoc(conversationRef, {
        convert: updatedConvert,
      });
  
      // Clear the message input field
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  const renderMessage = ({ item }: { item: Message }) => {
    // Ensure `convert` is an array of messages
    const messages: Convert[] = Array.isArray(item.convert) ? item.convert : [];
  
    return (
      <View>
        {messages.length > 0 ? (
          messages.map((messageData, index) => {
            if (!messageData || !messageData.senderId || !messageData.text) {
              return null; // Skip if incomplete data
            }
  
            const formattedDate = messageData.createdAt
              ? new Date(messageData.createdAt.seconds * 1000).toLocaleString()
              : 'Unknown time';
  
            return (
              <View
                key={index}
                style={[
                  tw`p-3 rounded-lg my-2`,
                  messageData.senderId === user?.email
                    ? tw`bg-pink-100 self-end`
                    : tw`bg-gray-200 self-start`,
                ]}
              >
                <Text style={tw`text-gray-800 text-sm`}>{messageData.text}</Text>
                <Text style={tw`text-gray-500 text-xs`}>{formattedDate}</Text>
              </View>
            );
          })
        ) : (
          <Text style={tw`text-gray-500 text-center`}>No messages yet</Text>
        )}
      </View>
    );
  };
  
  
  
  

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={tw`bg-pink-100 p-5 flex-row items-center shadow-md`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={tw`text-pink-700 text-lg mr-2`}>←</Text>
          </TouchableOpacity>
          <Text style={tw`text-pink-700 text-lg font-bold`}>{recipientName}</Text>
        </View>

        <FlatList
  data={messages}
  keyExtractor={(item) => item.id}
  renderItem={renderMessage}
  contentContainerStyle={tw`p-2`}
  ListEmptyComponent={<Text>No messages yet</Text>} // Display a message when no data
/>


        <View style={tw`flex-row items-center p-3 border-t border-gray-300 bg-white`}>
          <TextInput
            style={tw`flex-1 p-3 rounded-full bg-gray-200 text-sm text-gray-800`}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#888"
          />
          <TouchableOpacity
            style={tw`ml-3 p-3 rounded-full bg-pink-700`}
            onPress={handleSendMessage}
          >
            <Text style={tw`text-white text-sm font-bold`}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
