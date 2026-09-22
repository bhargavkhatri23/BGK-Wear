import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function test() {
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    console.log(`Found ${snap.size} reviews in the collection.`);
    snap.docs.forEach(doc => console.log(doc.id, doc.data()));
  } catch (e) {
    console.error('Error fetching reviews:', e);
  }
}
test().then(() => process.exit(0)).catch(() => process.exit(1));
