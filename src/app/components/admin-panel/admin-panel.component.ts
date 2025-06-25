import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { User } from '../../models/user.model';
import { Task } from '../../models/task.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  tasks: Task[] = [];

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTasks();
  }

  loadUsers(): void {
    this.users = this.authService.getAllUsers();
  }

  loadTasks(): void {
    this.tasks = this.taskService.getTasks();
  }

  deleteUser(userId: string): void {
    this.authService.deleteUser(userId);
    this.loadUsers();
  }

  deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId);
    this.loadTasks();
  }
}
