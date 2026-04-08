import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyCplHh-e6_50upzEJzE4MwJpyRELu2txnM',
  authDomain: 'aspire-ams.firebaseapp.com',
  projectId: 'aspire-ams',
  storageBucket: 'aspire-ams.firebasestorage.app',
  messagingSenderId: '353470471196',
  appId: '1:353470471196:web:75dc2f853ba640ddcc53d9',
  measurementId: 'G-JZ6SW3745T',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
