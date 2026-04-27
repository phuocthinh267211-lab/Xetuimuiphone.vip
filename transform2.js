import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

const newImpl = `
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));

const appAdmin = initializeApp(firebaseConfig);
const dbAdmin = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);

async function readDB() {
  try {
    const docRef = doc(dbAdmin, 'app', 'db');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      await setDoc(docRef, initialData);
      return initialData;
    }
  } catch (e) {
    console.error("Failed to read DB from Firestore:", e);
    return initialData;
  }
}

async function writeDB(data: any) {
  try {
    const docRef = doc(dbAdmin, 'app', 'db');
    await setDoc(docRef, data);
  } catch (e) {
    console.error("Failed to write DB to Firestore:", e);
  }
}
`;

// Replace from `import { initializeApp } from 'firebase-admin/app';` to the end of `async function writeDB`
code = code.replace(/import \{ initializeApp \} from 'firebase-admin\/app';[\s\S]*?async function writeDB\(data: any\) \{[\s\S]*?\n\}/, newImpl.trim());

fs.writeFileSync('server.ts', code);
console.log("Transformed.");
