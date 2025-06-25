import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'task-manager-users';
  private readonly SESSION_USER_KEY = 'task-manager-current-user';

  constructor() {}

  register(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): boolean {
    const users = this.getUsers();
    if (users.find(u => u.email === userData.email)) {
      return false; // email już istnieje
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(), // id jako string
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);
    this.saveUsers(users);
    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return false;

    sessionStorage.setItem(this.SESSION_USER_KEY, JSON.stringify(user));
    return true;
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_USER_KEY);
  }

  getCurrentUser(): User | null {
    const userJson = sessionStorage.getItem(this.SESSION_USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson) as User;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.STORAGE_KEY);
    if (!usersJson) return [];
    return JSON.parse(usersJson) as User[];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }
  getAllUsers(): User[] {
  const usersJson = localStorage.getItem(this.STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
  }

deleteUser(userId: string): void {
  const users = this.getAllUsers().filter(user => user.id !== userId);
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

}
