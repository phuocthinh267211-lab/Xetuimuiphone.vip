import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

async function test() {
  const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));
  const appAdmin = initializeApp(firebaseConfig);
  const dbAdmin = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);

  try {
    console.log("Reading...");
    const docRef = doc(dbAdmin, 'app', 'db');
    const docSnap = await getDoc(docRef);
    console.log(docSnap.exists() ? "Exists" : "Not Found");
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();
