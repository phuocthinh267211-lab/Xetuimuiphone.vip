import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');

// Add async to handlers
code = code.replace(/app\.(get|post|delete)\(('[^']+'),\s*\((req,\s*res)\)\s*=>\s*\{/g, 'app.$1($2, async ($3) => {');

// Replace readDB() calls
code = code.replace(/const db = readDB\(\);/g, 'const db = await readDB();');

// Replace writeDB(data) calls
code = code.replace(/writeDB\(([^)]+)\);/g, 'await writeDB($1);');

// Replace the implementation of readDB and writeDB
const newImpl = `
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-applet-config.json'), 'utf-8'));

const appAdmin = initializeApp();
const dbAdmin = getFirestore(appAdmin, firebaseConfig.firestoreDatabaseId);

async function readDB() {
  try {
    const doc = await dbAdmin.collection('app').doc('db').get();
    if (doc.exists) {
      return doc.data();
    } else {
      await dbAdmin.collection('app').doc('db').set(initialData);
      return initialData;
    }
  } catch (e) {
    console.error("Failed to read DB from Firestore:", e);
    return initialData;
  }
}

async function writeDB(data: any) {
  try {
    await dbAdmin.collection('app').doc('db').set(data);
  } catch (e) {
    console.error("Failed to write DB to Firestore:", e);
  }
}
`;

// Replace the old block from `function readDB()` to the end of `writeDB(data: any)` block.
code = code.replace(/function readDB\(\) \{[\s\S]*?function writeDB\(data: any\) \{[\s\S]*?\n\}/, newImpl.trim());

fs.writeFileSync('server.ts', code);
console.log("Transformed!");
