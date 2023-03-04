import { collection, getFirestore, doc, setDoc } from "firebase/firestore";
import app from "./firebase";
  
const db = getFirestore(app);
  
export async function createUser(uid, data) {
    const userRef = doc(collection(db, "users"), uid);
    await setDoc(userRef, data);
}