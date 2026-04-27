const fs = require('fs');
const admin = require('firebase-admin');

async function test() {
  const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  try {
    admin.initializeApp({ projectId: firebaseConfig.projectId });
    // In Node.js admin SDK v12/13, you can initialize a specific database
    // There is no explicit method on admin namespace sometimes, so let's try 
    // admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: firebaseConfig.projectId });
    const db = admin.firestore();
    const doc = await db.collection('app').doc('test-node').get();
    console.log('Success!', doc.exists);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
