import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDJUR-ZxV83fbsdqa5pYHd8XFxMuJS5yoc",
    authDomain: "post-it-ed810.firebaseapp.com",
    projectId: "post-it-ed810",
    storageBucket: "post-it-ed810.appspot.com",
    messagingSenderId: "112608374745",
    appId: "1:112608374745:web:da8c08a7f18c8eef9ab3c8",
    measurementId: "G-LB076G41MY"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
