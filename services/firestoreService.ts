import { db, auth } from './firebase';
import { 
  collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, 
  query, where, orderBy, onSnapshot, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { ApiKey, ChatSession, ActivityLog } from '../types';

const getUserRef = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return doc(db, "users", user.uid);
};

const getSubcollection = (collectionName: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  return collection(db, "users", user.uid, collectionName);
};

// --- User Profile ---
export const syncUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    });
  } else {
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      displayName: user.displayName // Update in case it changed
    });
  }
};

// --- API Keys ---
export const saveApiKey = async (apiKey: ApiKey) => {
  const ref = doc(getSubcollection('api_keys'), apiKey.id);
  await setDoc(ref, apiKey);
};

export const deleteApiKey = async (id: string) => {
  const ref = doc(getSubcollection('api_keys'), id);
  await deleteDoc(ref);
};

export const subscribeToApiKeys = (callback: (keys: ApiKey[]) => void) => {
  const q = query(getSubcollection('api_keys'), orderBy('addedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const keys = snapshot.docs.map(d => d.data() as ApiKey);
    callback(keys);
  });
};

// --- Chat Sessions ---
export const saveChatSession = async (session: ChatSession) => {
  const ref = doc(getSubcollection('chat_sessions'), session.id);
  // Ensure dates are converted to timestamps/numbers for Firestore
  const safeSession = JSON.parse(JSON.stringify(session)); 
  await setDoc(ref, safeSession);
};

export const deleteChatSession = async (id: string) => {
  // Soft delete
  const ref = doc(getSubcollection('chat_sessions'), id);
  await updateDoc(ref, { isDeleted: true });
};

export const restoreChatSession = async (id: string) => {
  const ref = doc(getSubcollection('chat_sessions'), id);
  await updateDoc(ref, { isDeleted: false });
};

export const subscribeToChatSessions = (callback: (sessions: ChatSession[]) => void) => {
  const q = query(getSubcollection('chat_sessions'), orderBy('lastModified', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(d => d.data() as ChatSession);
    callback(sessions);
  });
};

// --- Activity History (Dashboard, Education, Marketing) ---
export const saveActivity = async (
  type: 'DASHBOARD' | 'EDUCATION' | 'MARKETING',
  title: string,
  inputSummary: string,
  data: any
) => {
  const id = Date.now().toString();
  const activity: ActivityLog = {
    id,
    type,
    title,
    inputSummary,
    timestamp: Date.now(),
    data: JSON.parse(JSON.stringify(data)) // Ensure clean object
  };
  const ref = doc(getSubcollection('activities'), id);
  await setDoc(ref, activity);
};

export const subscribeToActivities = (callback: (logs: ActivityLog[]) => void) => {
  const q = query(getSubcollection('activities'), orderBy('timestamp', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(d => d.data() as ActivityLog);
    callback(logs);
  });
};
