import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

async function test() {
  try {
    const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
    const app = initializeApp({
      credential: applicationDefault(),
      projectId: config.projectId,
    });
    console.log('Project ID:', app.options.projectId);
    const db = getFirestore(app);
    // actually, let's try reading the specific databaseId since it's a named database
    const dbNamed = getFirestore(app, config.firestoreDatabaseId);
    
    const doc = await dbNamed.collection('app').doc('test').get();
    console.log('Success!', doc.exists);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
