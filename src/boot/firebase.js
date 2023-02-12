import * as firebase from 'firebase/app'
//import "firebase/firestore";
import "firebase/auth";
import "firebase/database"

const firebaseConfig = {
  apiKey: "AIzaSyAQ4rI6pXT697BShXz0weckVjNLUTq7I8c",
  authDomain: "cool-todo-28d00.firebaseapp.com",
  databaseURL: "https://cool-todo-28d00-default-rtdb.firebaseio.com",
  projectId: "cool-todo-28d00",
  storageBucket: "cool-todo-28d00.appspot.com",
  messagingSenderId: "1088482208025",
  appId: "1:1088482208025:web:ccae9fbabe78ce14c1bd88",
  measurementId: "G-D3Y6JPS5LY"
};

let firebaseApp = firebase.initializeApp(firebaseConfig)
let firebaseAuth = firebaseApp.auth()
let firebaseDb = firebaseApp.database()

export { firebaseAuth, firebaseDb }
