import fs from 'fs';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function test() {
  const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  try {
    const app = initializeApp({ projectId: firebaseConfig.projectId });
    const db = getFirestore(app);
    // Try to change db's ID... actually in firebase-admin 12 passed databaseId:
    const dbNamed = getFirestore(app, firebaseConfig.firestoreDatabaseId);

    const dbRef = dbNamed.collection('app').doc('test');
    await dbRef.set({ ok: true });
    console.log('Success set named DB via admin');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
