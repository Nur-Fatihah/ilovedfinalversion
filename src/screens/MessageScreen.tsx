import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { useAuthContext } from '../context/AuthContext';

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
}

const MessageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchConversations = async () => {
    if (!user?.email) return;

    setLoading(true);
    const conversationsQuery = query(collection(db, 'messages'));
    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const fetchedConversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        participants: doc.data().participants || [],
        lastMessage: doc.data().lastMessage || 'No messages yet',
      }));

      const userConversations = fetchedConversations.filter((conv) =>
        conv.participants.includes(user.email)
      );

      setConversations(userConversations);
      setLoading(false);
    });

    return unsubscribe;
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherParticipant = item.participants.find(
      (participant) => participant !== user?.email
    );

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: item.id,
            recipient: otherParticipant,
          })
        }
      >
        <Image
          source={{ uri: 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.cardContent}>
          <Text style={styles.participant}>{otherParticipant || 'Unknown'}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Image source={require('../../assets/iLovedLogo.png')} style={styles.logo} />
        <Text style={styles.headerText}>Messages</Text>
      </View>

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#c2185b" style={styles.loader} />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderConversation}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchConversations} />
            }
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyMessage}>No conversations available.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9f9f9' },
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
  logo: { width: 60, height: 60, marginBottom: 10 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#c2185b' },
  container: { flex: 1, paddingHorizontal: 10, paddingTop: 10 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  cardContent: { flex: 1 },
  participant: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  lastMessage: { fontSize: 14, color: '#777', marginTop: 5 },
  listContent: { paddingBottom: 20 },
  loader: { marginTop: 20 },
  emptyMessage: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
});

export default MessageScreen;
