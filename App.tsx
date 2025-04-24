import React, {useState, useEffect} from 'react'
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import LoginScreen from './screens/LoginScreen'
import SignupScreen from './screens/SignupScreen'
import TabNavigator from './navigator/TabNavigator';
import ChatScreen from './screens/ChatScreen';

const Stack = createNativeStackNavigator();

const App = () => {


  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);

  const auth = getAuth();

  function onAuthStateChangedListener(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedListener);
    return subscriber;
  }, []);

  if (initializing) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle= 'dark-content'
        backgroundColor='#fff'
      />
      <Stack.Navigator initialRouteName={user ? 'TabNavigator' : 'LoginScreen'}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App