import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function test() {
  const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  try {
    const app = initializeApp({ projectId: firebaseConfig.projectId });
    const db = getFirestore(app); // wait, database ID? getFirestore does not accept databaseId natively here, I think it's db = new Firestore({ projectId, databaseId }) from '@google-cloud/firestore' 
    // Wait, in later firebase-admin, getFirestore takes no databaseId? Let's check getFirestore(app)
    const dbRef = db.collection('app').doc('test');
    await dbRef.set({ ok: true });
    console.log('Success set default DB');
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
