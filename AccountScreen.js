import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, StyleSheet, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Icon, Button } from 'react-native-elements';
import { auth, db, storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, onSnapshot, updateDoc, arrayUnion, addDoc, collection } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import { signOut } from "firebase/auth";




const AccountScreen = () => {
    const [username, setUsername] = useState('');
    const [editingUsername, setEditingUsername] = useState(false);
    const [image, setImage] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const docRef = doc(db, 'users', auth.currentUser.uid);

        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                setProfile(doc.data());
                setUsername(doc.data().username);
            }
        });

        return unsubscribe;
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setImage(result.uri);
            await saveProfile(result.uri);
        }
    };

    const logout = async () => {
      try {
          await signOut(auth);
          navigation.replace('Login');
      } catch (error) {
          console.error(error);
      }
    };



    const saveProfile = async (uri) => {
        try {
            const response = await fetch(uri);
            const blob = await response.blob();

            var storageRef = ref(storage, `profiles/${auth.currentUser.uid}`);
            var uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on('state_changed', 
                (snapshot) => {},
                (error) => {
                    console.error(error);
                }, 
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                        await setDoc(doc(db, 'users', auth.currentUser.uid), {
                            username,
                            profilePicture: downloadURL,
                        });

                        setProfile({ username, profilePicture: downloadURL });
                    });
                }
            );
        } catch (error) {
            console.error(error);
        }
    };

    const handleBlurUsername = () => {
        setEditingUsername(false);
        setDoc(doc(db, 'users', auth.currentUser.uid), { username });
    };

    const addTask = () => {
        Alert.prompt(
            "Add Task",
            "Enter the task name",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Next",
                    onPress: task => {
                        if (task) {
                            Alert.prompt(
                                "Task Price",
                                "Enter the price for the task",
                                [
                                    {
                                        text: "Cancel",
                                        style: "cancel"
                                    },
                                    {
                                        text: "Submit",
                                        onPress: price => {
                                            if (price) {
                                                updateTask(task, price);
                                            } else {
                                                Alert.alert("Please enter a price");
                                            }
                                        }
                                    }
                                ],
                                "plain-text"
                            );
                        } else {
                            Alert.alert("Please enter a task");
                        }
                    }
                }
            ],
            "plain-text"
        );
    };

    const updateTask = async (task, price) => {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        console.log(`Adding task: ${task} with price: ${price} to user ${auth.currentUser.uid}`);
        
        // Update the task in the user's document
        await updateDoc(userRef, {
            tasks: arrayUnion({ task, price })
        })
        .then(() => console.log('Task added successfully to user'))
        .catch((error) => console.error('Error adding task to user:', error));

        // Add the task to the 'tasks' collection
        await addDoc(collection(db, 'tasks'), {
            task,
            price,
            userId: auth.currentUser.uid
        })
        .then(() => console.log('Task added successfully to tasks'))
        .catch((error) => console.error('Error adding task to tasks:', error));

        setProfile((prevProfile) => {
            console.log('Updating local state');
            return {
                ...prevProfile,
                tasks: [...(prevProfile.tasks || []), { task, price }],
            };
        });
    };

    const renderItem = ({ item }) => (
        <View style={styles.taskContainer}>
            <Text style={styles.taskText}>- {item.task} (${item.price})</Text>
        </View>
    );

    return (
      <TouchableOpacity style={styles.container} activeOpacity={1} onPress={handleBlurUsername}>
          <View style={styles.header}>
              <TouchableOpacity
                  onPress={pickImage}
                  onPressIn={event => event.stopPropagation()}
              >
                  <Image
                      source={{ uri: profile ? profile.profilePicture : 'https://www.w3schools.com/howto/img_avatar.png' }}
                      style={styles.profileImage}
                  />
              </TouchableOpacity>
              {editingUsername ? (
                  <TextInput
                      style={styles.usernameInput}
                      value={username}
                      onChangeText={setUsername}
                      onBlur={handleBlurUsername}
                      autoFocus
                  />
              ) : (
                  <TouchableOpacity
                      onPress={() => setEditingUsername(true)}
                      onPressIn={event => event.stopPropagation()}
                  >
                      <Text style={styles.username}>{profile ? profile.username : ''}</Text>
                  </TouchableOpacity>
              )}
          </View>
          <Button
              icon={
                  <Icon
                      name="add"
                      size={15}
                      color="white"
                  />
              }
              title="Add Task"
              onPress={addTask}
          />
          <Button
              title="Logout"
              onPress={logout}
          />
          <View style={styles.separator} />
          {profile && profile.tasks && 
              <FlatList
                  data={profile.tasks}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={renderItem}
              />
          }
      </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    usernameInput: {
        fontSize: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
    },
    separator: {
        height: 1,
        backgroundColor: 'gray',
        width: '80%',
        marginBottom: 20,
    },
    taskContainer: {
        padding: 10,
    },
    taskText: {
        fontSize: 16,
    },
});

export default AccountScreen;
