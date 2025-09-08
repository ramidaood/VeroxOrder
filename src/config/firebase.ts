import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCnghJ9_HJFx_cgYdk61wCHLWs4IJaWpsg",
    authDomain: "verox-94e5e.firebaseapp.com",
    projectId: "verox-94e5e",
    storageBucket: "verox-94e5e.firebasestorage.app",
    messagingSenderId: "1072921392874",
    appId: "1:1072921392874:web:6e1f2af95f437b6136c993",
    measurementId: "G-EVNYGGW6M3"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
