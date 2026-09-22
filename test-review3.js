import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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
    
    // Test viewsCount which was original
    await updateDoc(prodRef, {
      viewsCount: 2
    });
    console.log('Success viewsCount!');
    
  } catch (e) {
    console.error('Error:', e);
  }
}
test().then(() => process.exit(0)).catch(() => process.exit(1));
