import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAlJFjS26lVwsB7KHGenZPm43LcyhqKP-4",
  authDomain: "simpletune-46c58.firebaseapp.com",
  projectId: "simpletune-46c58",
  storageBucket: "simpletune-46c58.firebasestorage.app",
  messagingSenderId: "394871811733",
  appId: "1:394871811733:web:c9cb2f8e38fc02c24ff59c",
  measurementId: "G-JHG190019Q"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore , storage};