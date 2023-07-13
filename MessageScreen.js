import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, Button } from 'react-native';
import { auth, db } from './firebase';
import { collection, onSnapshot, addDoc } from "firebase/firestore";

const MessagesScreen = ({ route }) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  

  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const allMessages = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setMessages(allMessages);
    });

    return unsubscribe;
  }, [chatId]);

  const sendMessage = async () => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text: messageText,
      createdAt: new Date(),
      userId: auth.currentUser.uid,
    });

    setMessageText('');
  };

  const renderItem = ({ item }) => {
    const isCurrentUser = item.userId === auth.currentUser.uid;

    return (
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage]}>
        <Text>{item.text}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messageContainer: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#0f93fe',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5e5',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 10,
    padding: 10,
  },
});

export default MessagesScreen;
