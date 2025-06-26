export interface User {
  id: string;
  username: string;
  email: string;
  // password?: string; // Hasło przechowywane tylko w Firebase Auth, więc nie zapisuj w Firestore
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt?: Date;
}
