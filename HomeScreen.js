import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Button } from 'react-native';
import { auth, db } from './firebase';
import { collection, onSnapshot } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';


const HomeScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigation = useNavigation();


  useEffect(() => {
    const tasksRef = collection(db, 'tasks');
    const unsubscribe = onSnapshot(tasksRef, (snapshot) => {
      const allTasks = snapshot.docs
        .filter(doc => doc.data().userid !== auth.currentUser.uid)
        .map(doc => ({ ...doc.data(), id: doc.id }));
      setTasks(allTasks);
    });

    return unsubscribe;
  }, []);

  const acceptTask = async () => {
    // Create a chat between logged in user and task's user
    const chatId = [auth.currentUser.uid, selectedTask.userid].sort().join('-');
    const chatRef = doc(db, 'chats', chatId);
  
    await setDoc(chatRef, {
      users: [auth.currentUser.uid, selectedTask.userid],
    });
  
    // Create a new 'messages' subcollection for this chat
    const messagesRef = collection(chatRef, 'messages');
    await addDoc(messagesRef, {
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      text: `${auth.currentUser.displayName} has accepted the task.`,
      user: auth.currentUser.uid,
    });
  
    Alert.alert("Task Accepted", "A chat has been created. Go to messages to start conversation.");
    setModalVisible(false);
    navigation.navigate('Messages', { chatId });
  };
  


  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.note}
      onPress={() => {
        setSelectedTask(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.noteContent}>
        <Text style={styles.taskText}>{item.task}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item, index) => item.id}
        renderItem={renderItem}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{selectedTask ? selectedTask.task : ''}</Text>
            <Button
              onPress={acceptTask}
              title="Accept"
              color="green"
            />
            <Button
              onPress={() => setModalVisible(!modalVisible)}
              title="Close"
              color="#2196F3"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  note: {
    backgroundColor: '#ffff88',
    padding: 20,
    marginVertical: 10,
    width: '100%',
    borderRadius: 10,
  },
  noteContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskText: {
    fontSize: 16,
  },
  priceContainer: {
    backgroundColor: 'green',
    borderRadius: 5,
    padding: 5,
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 20,
    marginVertical: 5,
    width: '90%',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  taskText: {
    fontSize: 18,
  },
  taskPrice: {
    fontSize: 18,
    color: 'green',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default HomeScreen;
