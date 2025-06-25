export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // W produkcji: hashowane hasło
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}
