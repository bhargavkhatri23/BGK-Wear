import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function test() {
  let id;
  try {
    const snap = await getDocs(collection(db, 'outfits'));
    if (snap.empty) { console.log('no outfits'); return; }
    id = snap.docs[0].id;
    console.log('Testing on id:', id);
  } catch (e) {
    console.error('Error fetching docs:', e);
    return;
  }
  
  try {
    const prodRef = doc(db, 'outfits', id);
    await updateDoc(prodRef, {
      viewsCount: 2
    });
    console.log('Success viewsCount!');
  } catch (e) {
    console.error('Error updating doc:', e);
  }
}
test().then(() => process.exit(0)).catch(() => process.exit(1));
