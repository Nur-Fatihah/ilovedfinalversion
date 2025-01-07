import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import tw from 'twrnc';
import { collection, query, onSnapshot, doc, getDoc, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { useAuthContext } from '../context/AuthContext';

interface Conversation {
  id: string;
  seller_id: string;
  buyer_id: string;
  lastMessage: string;
}

const MessageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userNames, setUserNames] = useState<Record<string, { name: string, profilePicture: string }>>({});

  const fetchConversations = async () => {
    if (!user?.email) return;
  
    setLoading(true);
  
    const conversationsQuery = query(collection(db, 'messages'));
    const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
      const fetchedConversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        seller_id: doc.data().seller_id,
        buyer_id: doc.data().buyer_id,
        lastMessage: doc.data().lastMessage || 'No messages yet',
      }));
  
      // Filter conversations where the user is either the seller or the buyer
      const userConversations = fetchedConversations.filter(
        (conv) => conv.seller_id === user.email || conv.buyer_id === user.email
      );
  
      setConversations(userConversations);
  
      // Fetch names and profile pictures for participants in these conversations
      const participantIds = Array.from(
        new Set(
          userConversations.flatMap((conv) => [conv.seller_id, conv.buyer_id])
        )
      );
  
      // Debugging: Log participant IDs to ensure they are correct
      console.log('Participant IDs:', participantIds);

      // Fetch only relevant users using `where` clause
      const usersQuery = query(
        collection(db, 'users'),
        where('email', 'in', participantIds)  // Make sure you're matching the correct field (like 'email' or 'userId')
      );
  
      const usersSnapshot = await getDocs(usersQuery);
      const userMap: Record<string, { name: string, profilePicture: string }> = {};
      console.log('User Snapshot:', usersSnapshot);
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        console.log('Fetched user data:', userData); // Log to check structure
        if (userData.email) { // Ensure you're using the correct field names
          userMap[userData.email] = {
            name: userData.name || 'Unknown User',  // Map name
            profilePicture: userData.profilePicture || 'https://via.placeholder.com/50', // Map profile picture or fallback
          };
        }
      });
  
      // Update userNames with the map of user emails to names and profile pictures
      const nameMap: Record<string, { name: string, profilePicture: string }> = {};
      participantIds.forEach((id) => {
        const userInfo = userMap[id] || { name: 'Unknown User', profilePicture: 'https://via.placeholder.com/50' };
        nameMap[id] = userInfo;
      });
  
      setUserNames(nameMap);
      setLoading(false);
    });
  
    return unsubscribe;
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const renderConversation = ({ item }: { item: Conversation }) => {
    // Determine the other participant
    const otherParticipant =
      item.seller_id === user?.email ? item.buyer_id : item.seller_id;

    const otherParticipantInfo = userNames[otherParticipant] || {
      name: 'Fetching...',
      profilePicture: 'https://via.placeholder.com/50',
    };

    return (
      <TouchableOpacity
        style={tw`flex-row bg-white rounded-lg p-4 mb-3 shadow-md items-center`}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item.id,
            recipient: otherParticipant,
          })
        }
      >
        <Image
          source={{ uri: otherParticipantInfo.profilePicture }}
          style={tw`w-12 h-12 rounded-full mr-4`}
        />
        <View style={tw`flex-1`}>
          <Text style={tw`text-base font-bold text-gray-800`}>
            {otherParticipantInfo.name}
          </Text>
          <Text style={tw`text-sm text-gray-500 mt-1`}>{item.lastMessage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`bg-pink-100 p-5 items-center rounded-b-2xl shadow-md`}>
        <Image
          source={require('../../assets/iLovedLogo.png')}
          style={tw`w-15 h-15 mb-2`}
        />
        <Text style={tw`text-lg font-bold text-pink-700`}>Messages</Text>
      </View>

      <View style={tw`flex-1 px-3 pt-3`}>
        {loading ? (
          <ActivityIndicator size="large" color="#c2185b" style={tw`mt-5`} />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchConversations} />
            }
            contentContainerStyle={tw`pb-5`}
            ListEmptyComponent={
              <Text style={tw`text-center text-base text-gray-500 mt-5`}>
                No conversations available.
              </Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default MessageScreen;
