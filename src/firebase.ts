import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0939328828",
  appId: "1:1084382094632:web:f94780cd53b5761668dc1d",
  apiKey: "AIzaSyA60nQBoE4T7q3HD4hPrg9yzknG3XR1Bj8",
  authDomain: "gen-lang-client-0939328828.firebaseapp.com"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-f5fb86ec-ff1c-4fe8-a395-b82337142e9c");
export const googleProvider = new GoogleAuthProvider();
