import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { TaskService } from '../../services/task.service';
import { User } from '../../models/user.model';
import { Task } from '../../models/task.model';
import { Router } from '@angular/router';
import { gobackComponent } from '../goback/goback.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, gobackComponent],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  tasks: Task[] = [];

  constructor(
    private authService: FirebaseAuthService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTasks();
  }

  async loadUsers(): Promise<void> {
    try {
      this.users = await this.authService.getAllUsers();
    } catch (error) {
      console.error('Błąd podczas ładowania użytkowników:', error);
    }
  }

  async loadTasks(): Promise<void> {
    try {
      // Pobieramy WSZYSTKIE zadania, aby admin mógł je przeglądać
      this.tasks = await this.taskService.getAllTasks();
    } catch (error) {
      console.error('Błąd podczas ładowania zadań:', error);
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.authService.deleteUser(userId);
      await this.loadUsers();
    } catch (error) {
      console.error('Błąd podczas usuwania użytkownika:', error);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await this.taskService.deleteTask(taskId);
      await this.loadTasks();
    } catch (error) {
      console.error('Błąd podczas usuwania zadania:', error);
    }
  }
}
