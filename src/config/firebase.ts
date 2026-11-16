import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDULf46G4fK9TEzAZybld_cdNapCj-diqk",
  authDomain: "qreceitas.firebaseapp.com",
  projectId: "qreceitas",
  storageBucket: "qreceitas.firebasestorage.app",
  messagingSenderId: "553156759472",
  appId: "1:553156759472:web:b8e482964e34d016999075",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);