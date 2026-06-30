import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  writeBatch
} from 'firebase/firestore';
import { UserPerformance } from '../data/mockData';

const COLLECTION_NAME = 'users_wigs';

// Helper to define quarterly metrics structure
export function createDefaultQuarterlyMetrics() {
  return {
    q1: {
      revenue: { current: 0, target: 625000, formattedTarget: "6.25 Lakhs", progress: 0 },
      pipeline: { current: 0, target: 1875000, formattedTarget: "18.75 Lakhs", progress: 0 },
      seats: { current: 0, target: 31, formattedTarget: "31 seats", progress: 0 }
    },
    q2: {
      revenue: { current: 0, target: 625000, formattedTarget: "6.25 Lakhs", progress: 0 },
      pipeline: { current: 0, target: 1875000, formattedTarget: "18.75 Lakhs", progress: 0 },
      seats: { current: 0, target: 31, formattedTarget: "31 seats", progress: 0 }
    },
    q3: {
      revenue: { current: 0, target: 625000, formattedTarget: "6.25 Lakhs", progress: 0 },
      pipeline: { current: 0, target: 1875000, formattedTarget: "18.75 Lakhs", progress: 0 },
      seats: { current: 0, target: 31, formattedTarget: "31 seats", progress: 0 }
    },
    q4: {
      revenue: { current: 0, target: 625000, formattedTarget: "6.25 Lakhs", progress: 0 },
      pipeline: { current: 0, target: 1875000, formattedTarget: "18.75 Lakhs", progress: 0 },
      seats: { current: 0, target: 32, formattedTarget: "32 seats", progress: 0 }
    }
  };
}

/**
 * Fetch all users' WIG data from Firestore.
 * Fallbacks to empty array if collection doesn't exist or is empty.
 */
export async function fetchFirestoreUsers(): Promise<any[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  const users: any[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  return users;
}

/**
 * Save / Update a user's entire document (metrics + quarterlyMetrics).
 */
export async function saveUserWigData(userId: string, userData: any): Promise<void> {
  const userDocRef = doc(db, COLLECTION_NAME, userId);
  await setDoc(userDocRef, userData, { merge: true });
}

/**
 * Initialize Firestore collection with default quarterly data for all mock users.
 */
export async function initializeFirestoreCollection(mockUsers: UserPerformance[]): Promise<any[]> {
  const batch = writeBatch(db);
  const initializedUsers = mockUsers.map((user) => {
    return {
      ...user,
      quarterlyMetrics: createDefaultQuarterlyMetrics()
    };
  });

  for (const user of initializedUsers) {
    const docRef = doc(db, COLLECTION_NAME, user.id);
    // Destructure to avoid putting id in document body if id is document key,
    // though storing it is completely fine. Let's write the clean data.
    const { id, ...data } = user;
    batch.set(docRef, data);
  }

  await batch.commit();
  return initializedUsers;
}
