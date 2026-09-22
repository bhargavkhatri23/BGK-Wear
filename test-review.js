import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    const prodRef = doc(db, 'outfits', 'test-id'); // We'll need a real ID
    await updateDoc(prodRef, {
      reviewsCount: 1,
      rating: 5,
      updatedAt: serverTimestamp()
    });
    console.log('Success!');
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
