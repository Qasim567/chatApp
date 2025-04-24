import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Snackbar from 'react-native-snackbar';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const SignupScreen = ({navigation}) => {
  const [user, setUser] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.7,
    });

    if (!result.didCancel && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImageToFirebase = async (uri, userId) => {
    const filename = `userprofile_images/${userId}_${Date.now()}`;
    const reference = storage().ref(filename);
    await reference.putFile(uri);
    return await reference.getDownloadURL();
  };

  const onSignup = async () => {
    if (!user || !email || !password || !confirmpassword) {
      Snackbar.show({
        text: 'Please fill all fields first!',
        duration: Snackbar.LENGTH_LONG,
      });
      return;
    }

    if (password.length < 6) {
      Snackbar.show({
        text: 'Password must have at least six characters!',
        duration: Snackbar.LENGTH_LONG,
      });
      return;
    }

    if (password !== confirmpassword) {
      Snackbar.show({
        text: 'Password does not match!',
        duration: Snackbar.LENGTH_LONG,
      });
      return;
    }

    try {
      const authInstance = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        email,
        password,
      );
      const userId = userCredential.user.uid;

      await updateProfile(userCredential.user, {
        displayName: user,
      });

      let imageDownloadUrl = '';
      if (imageUri) {
        imageDownloadUrl = await uploadImageToFirebase(imageUri, userId);
      }

      await firestore()
        .collection('chatusers')
        .doc(userCredential.user.uid)
        .set({
          name: user,
          email: email,
          image: imageUri || '',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

      Snackbar.show({
        text: 'Account Created Successfully',
        duration: Snackbar.LENGTH_SHORT,
      });

      navigation.replace('TabNavigator');
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        Snackbar.show({
          text: 'That email address is invalid!',
          duration: Snackbar.LENGTH_LONG,
        });
      } else if (error.code === 'auth/email-already-in-use') {
        Snackbar.show({
          text: 'That email address is already in use!',
          duration: Snackbar.LENGTH_LONG,
        });
      } else {
        Snackbar.show({
          text: 'Signup failed!',
          duration: Snackbar.LENGTH_LONG,
        });
      }
      console.error('Signup error:', error);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={require('../assets/signup.png')} />
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{uri: imageUri}} style={styles.previewImage} />
          ) : (
            <>
              <FontAwesome name="user-o" size={20} color="#B2BEB5" />
              <Text style={styles.pickImageText}>Upload Profile Image</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
        </View>

        <View>
          <View style={styles.inputGroup}>
            <View
              style={[
                styles.passwordContainer,
                focusedInput === 'user' && styles.focusedInput,
              ]}>
              <FontAwesome name="user-o" size={20} color="#B2BEB5" />
              <TextInput
                style={styles.passwordInput}
                value={user}
                onChangeText={setUser}
                placeholder="FULL NAME"
                placeholderTextColor="#B2BEB5"
                onFocus={() => setFocusedInput('user')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View
              style={[
                styles.passwordContainer,
                focusedInput === 'email' && styles.focusedInput,
              ]}>
              <MaterialCommunityIcons
                name="email-box"
                size={20}
                color="#B2BEB5"
              />
              <TextInput
                style={styles.passwordInput}
                value={email}
                onChangeText={setEmail}
                placeholder="EMAIL"
                placeholderTextColor="#B2BEB5"
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View
              style={[
                styles.passwordContainer,
                focusedInput === 'password' && styles.focusedInput,
              ]}>
              <Icons name="lock-closed-outline" size={20} color="#B2BEB5" />
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="PASSWORD"
                placeholderTextColor="#B2BEB5"
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icons
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#B2BEB5"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View
              style={[
                styles.passwordContainer,
                focusedInput === 'confirmpassword' && styles.focusedInput,
              ]}>
              <Icons name="lock-closed-outline" size={20} color="#B2BEB5" />
              <TextInput
                style={styles.passwordInput}
                value={confirmpassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="CONFIRM PASSWORD"
                placeholderTextColor="#B2BEB5"
                onFocus={() => setFocusedInput('confirmpassword')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Icons
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color="#B2BEB5"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.signupButton} onPress={onSignup}>
            <Text style={styles.signupButtonText}>SIGNUP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
            <Text style={styles.signinLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  headerContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    marginBottom: 15,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  pickImageText: {
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 3,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    width: 300,
  },
  focusedInput: {
    borderWidth: 1,
    borderColor: '#6C63FF',
    width: 320,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: '#000',
  },
  signupButton: {
    backgroundColor: '#6C63FF',
    padding: 14,
    marginHorizontal: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: 14,
    color: '#B2BEB5',
    fontWeight: 'bold',
  },
  signinLink: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6C63FF',
  },
});
