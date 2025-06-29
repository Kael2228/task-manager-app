import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged
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
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private usersCollection: CollectionReference<DocumentData>;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users');

    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (!firebaseUser) {
        this.currentUserSubject.next(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(this.firestore, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          this.currentUserSubject.next(null);
          return;
        }

        const data = userDoc.data() as User & { createdAt?: any; updatedAt?: any };
        this.currentUserSubject.next({
          ...data,
          createdAt: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : (data.createdAt ?? null),
          updatedAt: data.updatedAt && typeof data.updatedAt.toDate === 'function' ? data.updatedAt.toDate() : (data.updatedAt ?? null)
        });
      } catch (error) {
        console.error('Błąd podczas pobierania danych użytkownika:', error);
        this.currentUserSubject.next(null);
      }
    });
  }

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

  async login(email: string, password: string): Promise<FirebaseUser> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    return cred.user;
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  async getAllUsers(): Promise<User[]> {
    const snapshot = await getDocs(this.usersCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data() as User & { createdAt?: any; updatedAt?: any };
      const { id, ...restData } = data; 

      return {
        id: doc.id,
        ...restData,
        createdAt: restData.createdAt && typeof restData.createdAt.toDate === 'function' ? restData.createdAt.toDate() : (restData.createdAt ?? null),
        updatedAt: restData.updatedAt && typeof restData.updatedAt.toDate === 'function' ? restData.updatedAt.toDate() : (restData.updatedAt ?? null)
      };
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await deleteDoc(doc(this.usersCollection, userId));
  }
}
