import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "mythic-impact-fv9wh",
  appId: "1:767132066403:web:5e20f97766ec2557064e56",
  apiKey: "AIzaSyClEZ8LT66frcNRXSMnQR8LD4muLg4hIsw",
  authDomain: "mythic-impact-fv9wh.firebaseapp.com",
  storageBucket: "mythic-impact-fv9wh.firebasestorage.app",
  messagingSenderId: "767132066403",
  measurementId: ""
};

let app: any = null;
let dbInstance: any = null;
let authInstance: any = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  dbInstance = getFirestore(app);
  authInstance = getAuth(app);
} catch (e) {
  console.warn("Firebase initialization warning:", e);
}

export const db = dbInstance;
export const auth = authInstance;
