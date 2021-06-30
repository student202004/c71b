import firebase from 'firebase'
require('@firebase/firestore')

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyD_UIElZdVm5W8NPXHtoq5EgFkK6Ye7kQU",
    authDomain: "wily-app-9b920.firebaseapp.com",
    databaseURL: "https://wily-app-9b920-default-rtdb.firebaseio.com",
    projectId: "wily-app-9b920",
    storageBucket: "wily-app-9b920.appspot.com",
    messagingSenderId: "63253085246",
    appId: "1:63253085246:web:f6e5fb8a623857d8c3e56f"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


  export default firebase.firestore();