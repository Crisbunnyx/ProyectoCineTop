// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQhx-vLOJayGP44iMfFCOWyM3FNlIUadE",
  authDomain: "bdcinetop.firebaseapp.com",
  projectId: "bdcinetop",
  storageBucket: "bdcinetop.firebasestorage.app",
  messagingSenderId: "911405929636",
  appId: "1:911405929636:web:3caf62662077bcde02c231"
};

// Initialize Firebase
const appFireBase = initializeApp(firebaseConfig);
export default appFireBase