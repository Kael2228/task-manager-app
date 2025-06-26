import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private usersCollection: CollectionReference<DocumentData>;

  constructor(private auth: Auth, private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users');
  }

  /**
   * Rejestracja nowego użytkownika i zapisanie jego danych do Firestore
   */
  async register(
    email: string,
    password: string,
    username: string,
    role: 'admin' | 'user' = 'user'
  ): Promise<FirebaseUser> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    await setDoc(doc(this.usersCollection, cred.user.uid), {
      id: cred.user.uid,
      email,
      username,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return cred.user;
  }

  /**
   * Logowanie użytkownika
   */
  async login(email: string, password: string): Promise<FirebaseUser> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  /**
   * Wylogowanie aktualnie zalogowanego użytkownika
   */
  async logout(): Promise<void> {
    await signOut(this.auth);
  }

  /**
   * Sprawdza, czy użytkownik jest aktualnie zalogowany (synchron)
   */
  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  /**
   * Pobranie pełnych danych aktualnie zalogowanego użytkownika z Firestore (async)
   */
  async getCurrentUser(): Promise<User | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(this.firestore, 'users', currentUser.uid));
    if (!userDoc.exists()) return null;

    // Konwertujemy daty z Firestore (Timestamp) na Date
    const data = userDoc.data() as User & { createdAt: any; updatedAt: any };
    return {
      ...data,
      createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt
    };
  }

  /**
   * Pobranie wszystkich użytkowników z Firestore
   */
  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(this.usersCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data() as User & { createdAt: any; updatedAt: any };
      return {
        ...data,
        createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt
      };
    });
  }

  /**
   * Usunięcie użytkownika z kolekcji Firestore (UWAGA: nie usuwa z Firebase Auth)
   */
  async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(this.usersCollection, userId));
  }
}
