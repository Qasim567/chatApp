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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {getAuth, signInWithEmailAndPassword} from '@react-native-firebase/auth';
import Snackbar from 'react-native-snackbar';
import Modal from 'react-native-modal';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const onLogin = () => {
    const authInstance = getAuth();
    signInWithEmailAndPassword(authInstance, email, password)
      .then(userCredential => {
        Snackbar.show({
          text: 'Login Successfully!',
          duration: Snackbar.LENGTH_SHORT,
        });
        navigation.replace('TabNavigator');
      })
      .catch(error => {
        if (email === '' || password === '') {
          Snackbar.show({
            text: 'Please enter your email and password first!',
            duration: Snackbar.LENGTH_LONG,
          });
        }
        if (error.code === 'auth/invalid-email') {
          Snackbar.show({
            text: 'That email address is invalid!',
            duration: Snackbar.LENGTH_LONG,
          });
        }
        if (error.code === 'auth/invalid-credential') {
          Snackbar.show({
            text: 'Wrong email or password!',
            duration: Snackbar.LENGTH_LONG,
          });
        }
      });
  };

  return (
    <KeyboardAvoidingView behavior="height" style={{flex: 1}}>
      <ScrollView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={require('../assets/login.png')} />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Log In</Text>
        </View>

        <View>
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
                onChangeText={value => setEmail(value)}
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
                onChangeText={value => setPassword(value)}
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

          <View style={styles.forgetContainer}>
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.forgetText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Modal isVisible={isModalVisible}>
            <View style={styles.modalContainer}>
              <View style={styles.modalheaderContainer}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <TouchableOpacity onPress={toggleModal}>
                  <Icons name="close-circle-outline" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your email"
                placeholderTextColor="#B2BEB5"
                value={resetEmail}
                onChangeText={text => setResetEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  if (resetEmail.trim() === '') {
                    Snackbar.show({
                      text: 'Please enter your email.',
                      duration: Snackbar.LENGTH_SHORT,
                    });
                    return;
                  }

                  const auth = getAuth();
                  auth
                    .sendPasswordResetEmail(resetEmail)
                    .then(() => {
                      Snackbar.show({
                        text: 'Password reset email sent!',
                        duration: Snackbar.LENGTH_LONG,
                      });
                      toggleModal();
                      setResetEmail('');
                    })
                    .catch(error => {
                      Snackbar.show({
                        text: 'Error: ' + error.message,
                        duration: Snackbar.LENGTH_LONG,
                      });
                    });
                }}>
                <Text style={styles.modalButtonText}>
                  Send Password Reset Link
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.replace('SignupScreen')}>
            <Text style={styles.signinLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  logo: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
  },
  headerContainer: {
    marginBottom: 13,
  },
  title: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
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
  forgetContainer: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  forgetText: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalheaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    borderColor: '#B2BEB5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: '#000',
  },
  modalButton: {
    backgroundColor: '#6C63FF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  loginButton: {
    backgroundColor: '#6C63FF',
    padding: 14,
    marginHorizontal: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  loginButtonText: {
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
