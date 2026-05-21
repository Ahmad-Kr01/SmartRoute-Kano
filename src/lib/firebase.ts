import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  collection, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  getDocFromServer,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Setup Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Error Handling Enum and interface
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Handle Firestore errors according to strict skill specifications.
 * Stringifies a detailed FirestoreErrorInfo JSON structure for debugging tools.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Raised: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validates connection to database on boot as mandated by the skill checklist.
 */
export async function testConnection() {
  const testPath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: Client is offline.");
    } else {
      // Ignore other validation errors that might arise from default-deny rules
    }
  }
}

// ==========================================
// Authentication Services
// ==========================================

export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in popup error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export function subscribeAuth(onChange: (user: User | null) => void) {
  return onAuthStateChanged(auth, onChange);
}

// ==========================================
// Shipment / Delivery CRUD & Real-Time Sync
// ==========================================

export interface RiderMapType {
  name: string;
  phone: string;
  avatar: string;
  rating: number;
  vehicle: string;
  license: string;
  location: string;
}

export interface TimelineCheckpost {
  time: string;
  status: string;
  desc: string;
  done: boolean;
}

export interface DbShipment {
  id: string; // Waybill Code
  recipient: string;
  recipientPhone?: string; // Target recipient phone for real-time Africa's Talking SMS notifications
  destination: string;
  hub: string;
  sender: string;
  cargo: string;
  weight: string;
  status: 'Pre-Dispatch' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  otpCode: string;
  rider: RiderMapType;
  timeline: TimelineCheckpost[];
  ownerId: string;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}

/**
 * Creates/Stores a new delivery shipment record in Firestore.
 */
export async function createShipment(shipment: Omit<DbShipment, 'ownerId' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to create a shipment.');
  }

  const shipmentId = shipment.id;
  const docPath = `shipments/${shipmentId}`;

  const payload: DbShipment = {
    ...shipment,
    ownerId: currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  try {
    const docRef = doc(db, 'shipments', shipmentId);
    await setDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

/**
 * Updates an existing delivery record status and waypoint logs.
 */
export async function updateShipmentStatus(
  shipmentId: string, 
  status: 'Pre-Dispatch' | 'In Transit' | 'Out for Delivery' | 'Delivered',
  timeline: TimelineCheckpost[]
): Promise<void> {
  const docPath = `shipments/${shipmentId}`;
  try {
    const docRef = doc(db, 'shipments', shipmentId);
    await updateDoc(docRef, {
      status,
      timeline,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Fully updates/overrides any part of a shipment record (except immutable fields).
 */
export async function updateShipmentPayload(
  shipmentId: string,
  payload: Partial<Omit<DbShipment, 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docPath = `shipments/${shipmentId}`;
  try {
    const docRef = doc(db, 'shipments', shipmentId);
    await updateDoc(docRef, {
      ...payload,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

/**
 * Deletes a shipment record from the database.
 */
export async function deleteShipment(shipmentId: string): Promise<void> {
  const docPath = `shipments/${shipmentId}`;
  try {
    const docRef = doc(db, 'shipments', shipmentId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Subscribe to the real-time list of shipments created by the current authenticated merchant user.
 */
export function subscribeShipments(
  onUpdate: (shipments: DbShipment[]) => void,
  onError: (error: unknown) => void
) {
  const currentUser = auth.currentUser;
  const path = 'shipments';
  if (!currentUser) {
    const emptyUnsub = () => {};
    return emptyUnsub;
  }

  const q = query(
    collection(db, 'shipments'),
    where('ownerId', '==', currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const results: DbShipment[] = [];
      snapshot.forEach((docSnap) => {
        results.push(docSnap.data() as DbShipment);
      });
      onUpdate(results);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      onError(error);
    }
  );
}

// Call connection test
testConnection();
