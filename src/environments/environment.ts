import { initializeApp } from '@angular/fire/app';
import {  getAnalytics } from 'firebase/analytics';
export const environment = {
      STORAGE_KEY : 'todoGridData',
      FIRESTORE_COLLECTION : 'todoGrid',
      quotsAPI:'https://api.quotable.io/random'
    
};
// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBHFN8RIDbOTFdK7gXLIH6DIJ2PvIoyxYQ",
  authDomain: "days-45e8c.firebaseapp.com",
  projectId: "days-45e8c",
  storageBucket: "days-45e8c.firebasestorage.app",
  messagingSenderId: "1046021570178",
  appId: "1:1046021570178:web:243397c15a71042e797e9b",
  measurementId: "G-XBE5G9VW5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);