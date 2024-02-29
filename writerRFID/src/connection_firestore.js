
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyBD0MkGw5nvh6FHCP_mLWOMnmVrKXX7Gv0",
    authDomain: "db-writerrfid.firebaseapp.com",
    projectId: "db-writerrfid",
    storageBucket: "db-writerrfid.appspot.com",
    messagingSenderId: "715392780291",
    appId: "1:715392780291:web:38f79dbcf59a71c8b8a636"
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

module.exports = firestore;




