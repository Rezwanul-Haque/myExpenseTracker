// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'

import {
  getReactNativePersistence,
  initializeAuth
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from '@firebase/firestore'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDcqM2qh00safkF6HsqWFpMZE3Ictp4JWs",
  authDomain: "littlegiantsapps-3731c.firebaseapp.com",
  projectId: "littlegiantsapps-3731c",
  storageBucket: "littlegiantsapps-3731c.firebasestorage.app",
  messagingSenderId: "416657353178",
  appId: "1:416657353178:web:0de5231955f631408c78e3",
  measurementId: "G-NWFMVQD6SD"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)

export const auth = initializeAuth(
  app, {
  persistence: getReactNativePersistence(AsyncStorage),
})

export const firestore = getFirestore(app)