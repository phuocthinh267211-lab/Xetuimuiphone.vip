import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const appAdmin = initializeApp(firebaseConfig);
const dbAdmin = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);
console.log(dbAdmin ? 'Works' : 'Fails');
