import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';  // <-- import FormsModule
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-management',
  standalone: true,            // <-- standalone component
  imports: [FormsModule, CommonModule],      // <-- import FormsModule tutaj
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  newUser: Partial<User> = {
    username: '',
    email: '',
    password: '',
    role: 'user'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = this.authService.getAllUsers();  // Zakładam, że ta metoda istnieje
  }

  addUser(): void {
    if (!this.newUser.username || !this.newUser.email || !this.newUser.password) {
      alert('Wypełnij wszystkie wymagane pola');
      return;
    }

    const success = this.authService.register({
      username: this.newUser.username,
      email: this.newUser.email,
      password: this.newUser.password,
      role: this.newUser.role || 'user',
    });

    if (success) {
      alert('Użytkownik dodany');
      this.newUser = { username: '', email: '', password: '', role: 'user' };
      this.loadUsers();
    } else {
      alert('Użytkownik o takim emailu już istnieje');
    }
  }

  deleteUser(userId: string): void {
    this.authService.deleteUser(userId);  // Zakładam, że ta metoda istnieje
    this.loadUsers();
  }
}
