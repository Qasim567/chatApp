import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import React, {useState, useEffect} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {getAuth} from '@react-native-firebase/auth';
import auth from '@react-native-firebase/auth';
import Snackbar from 'react-native-snackbar';
import firestore from '@react-native-firebase/firestore';

const ProfileScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [aboutexpanded, setAboutExpanded] = useState(false);
  const [privacyexpanded, setPrivacyExpanded] = useState(false);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = getAuth().currentUser;
      if (user) {
        setName(user.displayName || 'User');

        try {
          const userDoc = await firestore()
            .collection('chatusers')
            .doc(user.uid)
            .get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            setImage(userData.image); 
          }
        } catch (err) {
          console.log('Error fetching profile image:', err);
        }
      }
    };

    fetchUserData();
  }, []);

  const onLogout = () => {
    auth()
      .signOut()
      .then(() => {
        Snackbar.show({
          text: 'Logout Successfully!',
          duration: Snackbar.LENGTH_SHORT,
        });
        navigation.replace('LoginScreen');
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
        <MaterialIcons name="logout" size={24} color="#FF4C4C" />
      </TouchableOpacity>
      <View style={styles.profileImageContainer}>
        {image ? (
          <Image style={styles.logo} source={{uri: image}} />
        ) : (
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.userName}>{name}</Text>
      <TouchableOpacity
        style={styles.itemBtn}
        onPress={() => setAboutExpanded(!aboutexpanded)}>
        <Text style={styles.itemBtnTxt}>About</Text>
        <MaterialIcons
          name={aboutexpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color="#999"
        />
      </TouchableOpacity>
      {aboutexpanded && (
        <View style={styles.aboutContent}>
          <Text style={styles.aboutText}>
            This is a simple yet powerful chat app that lets you connect with
            your friends in real time. You can exchange instant messages, stay
            in touch with your loved ones, and enjoy a smooth, secure chatting
            experience anytime, anywhere.
          </Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.itemBtn}
        onPress={() => setPrivacyExpanded(!privacyexpanded)}>
        <Text style={styles.itemBtnTxt}>Privacy Policy</Text>
        <MaterialIcons
          name={privacyexpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={20}
          color="#999"
        />
      </TouchableOpacity>
      {privacyexpanded && (
        <View style={styles.aboutContent}>
          <Text style={styles.aboutText}>
            We value your privacy and are committed to protecting your data. All
            your conversations are end-to-end encrypted, ensuring only you and
            the recipient can read them. We do not store or share your messages
            with any third parties under any circumstances.
          </Text>
        </View>
      )}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 10,
  },
  logoutButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 5,
    borderRadius: 5,
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20
  }, 
  logo: {
    width: 120,
    height: 120,
    borderRadius: 50,
  },
  initialsCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  itemBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  itemBtnTxt: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  aboutContent: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#555',
  },
});
