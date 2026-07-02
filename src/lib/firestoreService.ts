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

// Helper to generate a 6-week progression curve with a bit of organic variance
export function generateWeeklyHistory(
  revenueTarget: number,
  revenueCurrent: number,
  pipelineTarget: number,
  pipelineCurrent: number,
  seatsTarget: number,
  seatsCurrent: number
) {
  const steps = [0.12, 0.28, 0.45, 0.65, 0.82, 1.0];
  const variance = [0.94, 1.06, 0.98, 1.03, 0.97, 1.0];

  return steps.map((scale, index) => {
    const v = variance[index];
    // Cap at current value to ensure it matches the actual dashboard score at Week 6
    const revVal = index === 5 ? revenueCurrent : Math.min(Math.round(revenueCurrent * scale * v), revenueCurrent);
    const pipeVal = index === 5 ? pipelineCurrent : Math.min(Math.round(pipelineCurrent * scale * v), pipelineCurrent);
    const seatVal = index === 5 ? seatsCurrent : Math.min(Math.round(seatsCurrent * scale * v), seatsCurrent);

    return {
      week: `Week ${index + 1}`,
      revenue: revVal,
      pipeline: pipeVal,
      seats: seatVal
    };
  });
}

// Helper to generate a 6-week scorecard of weekly commitments
// Each user starts with empty commitments and adds their own
export function generateDefaultCommitments(userId?: string) {
  return [
    { week: 1, items: [] },
    { week: 2, items: [] },
    { week: 3, items: [] },
    { week: 4, items: [] },
    { week: 5, items: [] },
    { week: 6, items: [] }
  ];
}

// Helper to define quarterly metrics structure
export function createDefaultQuarterlyMetrics(user?: any) {
  // Seed Q1 using user core metrics from mockUsers if available
  const q1RevCurrent = user ? user.metrics.revenue.current : 0;
  const q1PipeCurrent = user ? user.metrics.pipeline.current : 0;
  const q1SeatsCurrent = user ? user.metrics.seats.current : 0;

  const q1RevTarget = 625000;
  const q1PipeTarget = 1875000;
  const q1SeatsTarget = 31;

  return {
    q1: {
      revenue: { current: q1RevCurrent, target: q1RevTarget, formattedTarget: "6.25 Lakhs", progress: q1RevTarget > 0 ? Math.round((q1RevCurrent / q1RevTarget) * 100) : 0 },
      pipeline: { current: q1PipeCurrent, target: q1PipeTarget, formattedTarget: "18.75 Lakhs", progress: q1PipeTarget > 0 ? Math.round((q1PipeCurrent / q1PipeTarget) * 100) : 0 },
      seats: { current: q1SeatsCurrent, target: q1SeatsTarget, formattedTarget: "31 seats", progress: q1SeatsTarget > 0 ? Math.round((q1SeatsCurrent / q1SeatsTarget) * 100) : 0 },
      weeklyHistory: generateWeeklyHistory(q1RevTarget, q1RevCurrent, q1PipeTarget, q1PipeCurrent, q1SeatsTarget, q1SeatsCurrent),
      commitments: generateDefaultCommitments(user?.id)
    },
    q2: {
      revenue: { current: 0, target: 625000, formattedTarget: "6.25 Lakhs", progress: 0 },
      pipeline: { current: 0, target: 1875000, formattedTarget: "18.75 Lakhs", progress: 0 },
      seats: { current: 0, target: 31, formattedTarget: "31 seats", progress: 0 },
      weeklyHistory: generateWeeklyHistory(625000, 0, 1875000, 0, 31, 0),
      commitments: generateDefaultCommitments(user?.id)
    },
    q3: {
      revenue: { current: 0, target: 625000, formattedTarget: "6.25 Lakhs", progress: 0 },
      pipeline: { current: 0, target: 1875000, formattedTarget: "18.75 Lakhs", progress: 0 },
      seats: { current: 0, target: 31, formattedTarget: "31 seats", progress: 0 },
      weeklyHistory: generateWeeklyHistory(625000, 0, 1875000, 0, 31, 0),
      commitments: generateDefaultCommitments(user?.id)
    },
    q4: {
      revenue: { current: 0, target: 625000, formattedTarget: "6.25 Lakhs", progress: 0 },
      pipeline: { current: 0, target: 1875000, formattedTarget: "18.75 Lakhs", progress: 0 },
      seats: { current: 0, target: 32, formattedTarget: "32 seats", progress: 0 },
      weeklyHistory: generateWeeklyHistory(625000, 0, 1875000, 0, 32, 0),
      commitments: generateDefaultCommitments(user?.id)
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
      quarterlyMetrics: createDefaultQuarterlyMetrics(user)
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
