import { Firestore } from '@google-cloud/firestore';
import fs from 'fs';

async function test() {
  try {
    const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
    const firestore = new Firestore({
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId
    });
    const doc = await firestore.collection('app').doc('test').get();
    console.log('Success!', doc.exists);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
