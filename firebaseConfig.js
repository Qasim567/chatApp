// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4KeIU0zp8VWxv87UZnwXXQ7Mi7B4J4ZI",
  authDomain: "iotcar-9259e.firebaseapp.com",
  projectId: "iotcar-9259e",
  storageBucket: "iotcar-9259e.appspot.com",
  messagingSenderId: "755512017161",
  appId: "1:755512017161:android:b7829e2c3c7fa97cbbd3d8"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
