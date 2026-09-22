import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  try {
    const snap = await getDocs(collection(db, 'outfits'));
    if (snap.empty) { console.log('no outfits'); return; }
    const id = snap.docs[0].id;
    console.log('Testing on id:', id);
    const prodRef = doc(db, 'outfits', id);
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
