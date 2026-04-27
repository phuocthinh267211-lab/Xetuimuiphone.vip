import * as admin from 'firebase-admin';

async function test() {
  try {
    admin.initializeApp();
    console.log('Project ID:', admin.app().options.projectId);
    const db = admin.firestore();
    const doc = await db.collection('app').doc('test').get();
    console.log('Success!', doc.exists);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
