import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({navigation}) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = auth().currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const currentUserId = currentUser.uid;
        const snapshot = await firestore().collection('chatusers').get();

        const userList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(user => user.id !== currentUserId);

        setUsers(userList);
        setFilteredUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = query => {
    setSearchQuery(query);
    if (query === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        user =>
          user.name && user.name.toLowerCase().includes(query.toLowerCase()),
      );
      setFilteredUsers(filtered);
    }
  };

  const handleMessagePress = receiver => {
    navigation.navigate('ChatScreen', {
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverImage: receiver.image,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter name to search"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#aaa"
        />
        <FontAwesome
          name="search"
          size={20}
          color="#888"
          style={styles.searchIcon}
        />
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.userItem}>
            <View style={styles.usersInfo}>
              {item.image ? (
                <Image source={{uri: item.image}} style={styles.imgexist} />
              ) : (
                <View style={styles.imgnotexist}>
                  <Text style={{color: '#fff', fontSize: 20}}>
                    {item.name?.charAt(0)}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => handleMessagePress(item)}>
              <Text style={styles.messageText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  searchIcon: {
    marginLeft: 8,
  },
  userItem: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 13,
    borderColor: '#ddd',
    marginBottom: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  userEmail: {
    color: '#B2BEB5',
    fontSize: 11
  },
  imgexist: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 5,
  },
  imgnotexist: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  messageButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
