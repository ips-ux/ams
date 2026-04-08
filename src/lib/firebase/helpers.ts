// =============================================================================
// Aspire AMS — Generic Firestore CRUD Helpers
// Typed factory functions for user-scoped and global Firestore collections.
// =============================================================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
  type CollectionReference,
} from 'firebase/firestore'
import { db } from '@/config/firebase'

// =============================================================================
// Internal helpers
// =============================================================================

/**
 * Converts a Firestore DocumentSnapshot to a typed model.
 * Merges the document id with its data payload.
 */
function docToModel<T extends { id: string }>(
  snapshot: { id: string; data(): DocumentData | undefined },
): T {
  return { id: snapshot.id, ...snapshot.data() } as T
}

// =============================================================================
// Collection references
// =============================================================================

/**
 * Returns a typed CollectionReference for user-scoped subcollections.
 * Path: /users/{userId}/{collectionName}
 */
export function userCollection(
  userId: string,
  collectionName: string,
): CollectionReference {
  return collection(db, 'users', userId, collectionName)
}

// -- Global / community collections ------------------------------------------

/** Public community directory profiles. Path: /community/directory/profiles */
export const communityCollection = collection(
  db,
  'community',
  'directory',
  'profiles',
)

/** Community feedback items. Path: /community/feedback/items */
export const feedbackCollection = collection(
  db,
  'community',
  'feedback',
  'items',
)

/** Community collaboration requests. Path: /community/collaborations/items */
export const collabsCollection = collection(
  db,
  'community',
  'collaborations',
  'items',
)

/**
 * Aspire methodology documents (read-only guides).
 * Path: /aspireMethods
 */
export const methodologyCollection = collection(db, 'aspireMethods')

// =============================================================================
// CRUD helpers
// =============================================================================

/**
 * Fetches a single document by ID from the given collection.
 * Returns null if the document does not exist.
 */
export async function getDocument<T extends { id: string }>(
  collectionRef: CollectionReference,
  docId: string,
): Promise<T | null> {
  const ref = doc(collectionRef, docId)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return null
  return docToModel<T>(snapshot)
}

/**
 * Fetches all documents from a collection with optional Firestore query constraints.
 * Constraints are applied in the order provided (where, orderBy, limit, etc.).
 */
export async function getDocuments<T extends { id: string }>(
  collectionRef: CollectionReference,
  constraints?: QueryConstraint[],
): Promise<T[]> {
  const q =
    constraints && constraints.length > 0
      ? query(collectionRef, ...constraints)
      : query(collectionRef)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToModel<T>(d))
}

/**
 * Adds a new document to a collection.
 * Automatically injects `createdAt` and `updatedAt` server timestamps.
 * Returns the new document ID.
 */
export async function addDocument<T extends object>(
  collectionRef: CollectionReference,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const docRef = await addDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Updates fields on an existing document.
 * Automatically refreshes the `updatedAt` server timestamp.
 */
export async function updateDocument(
  collectionRef: CollectionReference,
  docId: string,
  data: Partial<Record<string, unknown>>,
): Promise<void> {
  const ref = doc(collectionRef, docId)
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Deletes a document from a collection by ID.
 */
export async function deleteDocument(
  collectionRef: CollectionReference,
  docId: string,
): Promise<void> {
  const ref = doc(collectionRef, docId)
  await deleteDoc(ref)
}

// =============================================================================
// Real-time listeners
// =============================================================================

/**
 * Subscribes to real-time updates on a collection.
 * Applies optional query constraints (where, orderBy, limit, etc.).
 * Calls `callback` immediately with the current state, then on every change.
 * Returns an unsubscribe function — call it to stop listening.
 */
export function onDocumentsSnapshot<T extends { id: string }>(
  collectionRef: CollectionReference,
  callback: (docs: T[]) => void,
  constraints?: QueryConstraint[],
): Unsubscribe {
  const q =
    constraints && constraints.length > 0
      ? query(collectionRef, ...constraints)
      : query(collectionRef)
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => docToModel<T>(d)))
  })
}

/**
 * Subscribes to real-time updates on a single document.
 * Calls `callback` with the typed model on each change, or null if deleted/absent.
 * Returns an unsubscribe function — call it to stop listening.
 */
export function onDocumentSnapshot<T extends { id: string }>(
  collectionRef: CollectionReference,
  docId: string,
  callback: (document: T | null) => void,
): Unsubscribe {
  const ref = doc(collectionRef, docId)
  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
    } else {
      callback(docToModel<T>(snapshot))
    }
  })
}
