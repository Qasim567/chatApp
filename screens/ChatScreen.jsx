import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import Video from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icons from 'react-native-vector-icons/Ionicons';

const audioRecorderPlayer = new AudioRecorderPlayer();

const ChatScreen = ({route, navigation}) => {
  const {senderId, senderName, receiverId, receiverName, receiverImage} =
    route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioPath, setAudioPath] = useState('');
  const flatListRef = useRef();

  const chatId =
    senderId > receiverId
      ? `${senderId}_${receiverId}`
      : `${receiverId}_${senderId}`;

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chitchats')
      .doc(chatId)
      .collection('chatmessages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
      });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    await firestore()
      .collection('chitchats')
      .doc(chatId)
      .collection('chatmessages')
      .add({
        text: message,
        senderId,
        receiverId,
        senderName,
        receiverName,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    setMessage('');
  };

  const sendMediaMessage = async (mediaUrl, mediaType) => {
    await firestore()
      .collection('chitchats')
      .doc(chatId)
      .collection('chatmessages')
      .add({
        text: '',
        senderId,
        receiverId,
        senderName,
        receiverName,
        mediaType,
        mediaUrl,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  };

  const pickMedia = type => {
    launchImageLibrary({mediaType: type}, async response => {
      if (
        !response.didCancel &&
        !response.errorCode &&
        response.assets.length > 0
      ) {
        const asset = response.assets[0];
        const uri = asset.uri;
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const ref = storage().ref(`chatmedia/${filename}`);
        await ref.putFile(uri);
        const downloadUrl = await ref.getDownloadURL();
        await sendMediaMessage(downloadUrl, type === 'photo' ? 'image' : type);
      }
    });
  };

  const startRecording = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }
    const result = await audioRecorderPlayer.startRecorder();
    setRecording(true);
    setAudioPath(result);
  };

  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    setRecording(false);

    const filename = `voice_${Date.now()}.mp4`;
    const ref = storage().ref(`chatmedia/${filename}`);
    await ref.putFile(audioPath);
    const downloadUrl = await ref.getDownloadURL();
    await sendMediaMessage(downloadUrl, 'audio');
  };

  const playAudio = async url => {
    try {
      await audioRecorderPlayer.stopPlayer();
      await audioRecorderPlayer.startPlayer(url);
      audioRecorderPlayer.addPlayBackListener(e => {
        if (e.current_position === e.duration) {
          audioRecorderPlayer.stopPlayer();
          audioRecorderPlayer.removePlayBackListener();
        }
      });
    } catch (err) {
      console.warn('Audio play error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" color="#000" size={26} />
        </TouchableOpacity>
        {receiverImage ? (
          <Image source={{uri: receiverImage}} style={styles.profilePic} />
        ) : (
          <View style={styles.profileInitialCircle}>
            <Text style={styles.profileInitialText}>
              {receiverName?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.receiverName}>{receiverName}</Text>
      </View>

      <ImageBackground
        source={require('../assets/background.png')}
        style={styles.chatBackground}
        resizeMode="cover">
        <View style={styles.chatHeaderView}>
          <Icons name="lock-closed" size={20} color="#B2BEB5" />
          <Text style={{fontSize: 13}}>
            Messages are end-to-end encrypted. Only people in this chat can read
            or listen to them.
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          inverted
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 10, paddingTop: 5}}
          style={styles.chatList}
          renderItem={({item}) => (
            <View
              style={[
                styles.msgBubble,
                item.senderId === senderId ? styles.myMsg : styles.otherMsg,
              ]}>
              {item.mediaType === 'image' && (
                <Image source={{uri: item.mediaUrl}} style={styles.imageMsg} />
              )}
              {item.mediaType === 'video' && (
                <Video
                  source={{uri: item.mediaUrl}}
                  style={styles.videoMsg}
                  controls
                  resizeMode="cover"
                />
              )}
              {item.mediaType === 'audio' && (
                <TouchableOpacity onPress={() => playAudio(item.mediaUrl)}>
                  <Text style={styles.msgText}>🎧 Play</Text>
                </TouchableOpacity>
              )}
              {item.text !== '' && (
                <Text style={styles.msgText}>{item.text}</Text>
              )}
            </View>
          )}
        />
      </ImageBackground>

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => pickMedia('image')}>
          <MaterialIcons name="photo" size={23} color="#6C63FF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickMedia('video')}>
          <MaterialIcons name="videocam" size={26} color="#6C63FF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <MaterialIcons
            name={recording ? 'stop' : 'mic'}
            size={26}
            color="#6C63FF"
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <MaterialIcons name="send" color="#6C63FF" size={26} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    gap: 13,
  },
  profilePic: {
    width: 35,
    height: 35,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 5,
  },
  profileInitialCircle: {
    width: 35,
    height: 35,
    borderRadius: 50,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    elevation: 4,
  },
  profileInitialText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  receiverName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatBackground: {
    flex: 1,
  },
  chatList: {
    flex: 1,
  },
  chatHeaderView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'lightgray',
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    borderColor: '#ccc',
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
  },
  msgBubble: {
    maxWidth: '75%',
    margin: 10,
    padding: 8,
    borderRadius: 10,
  },
  myMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  otherMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  msgText: {
    fontSize: 15,
    color: '#000',
  },
  imageMsg: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  videoMsg: {
    width: 250,
    height: 200,
    borderRadius: 10,
  },
});
