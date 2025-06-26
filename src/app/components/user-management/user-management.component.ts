import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';

interface NewUserForm {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  newUser: NewUserForm = {
    username: '',
    email: '',
    password: '',
    role: 'user'
  };

  constructor(private authService: FirebaseAuthService) {}

  async ngOnInit(): Promise<void> {
    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.users = await this.authService.getAllUsers();
  }

  async addUser(): Promise<void> {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      alert('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      await this.authService.register(
        this.newUser.email,
        this.newUser.password,
        this.newUser.username,
        this.newUser.role
      );
      alert('Użytkownik dodany');
      this.newUser = { username: '', email: '', password: '', role: 'user' };
      await this.loadUsers();
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Użytkownik o takim emailu już istnieje');
      } else {
        alert('Wystąpił błąd podczas dodawania użytkownika');
      }
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await this.authService.deleteUser(userId);
    await this.loadUsers();
  }
}
