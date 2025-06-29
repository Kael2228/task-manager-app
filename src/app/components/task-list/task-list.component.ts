import { Component, OnInit } from '@angular/core';
import { Task, Priority, Status } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TaskFormComponent } from '../task-form/task-form.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';


@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TaskFormComponent, 
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  filterForm: FormGroup;
  priorities = [Priority.low, Priority.medium, Priority.high];
  statuses = [Status.todo, Status.in_progress, Status.done];
  sortField: 'priority' | 'dueDate' = 'dueDate';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentUserEmail = '';
  currentUserRole: 'admin' | 'user' | null = null;
  editingTask: Task | null = null;
  showForm = false;

  constructor(
    private taskService: TaskService,
    private authService: FirebaseAuthService,
    private location: Location,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      priority: [''],
      assignedUser: ['']
    });
  }
  goBack(): void {
    this.location.back();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(async user => {
      this.currentUserEmail = user?.email || '';
      this.currentUserRole = user?.role || null;
      await this.loadTasks();
    });

    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  private async loadTasks(): Promise<void> {
    if (!this.currentUserEmail) {
      this.tasks = [];
      this.filteredTasks = [];
      return;
    }

    this.tasks = await this.taskService.getTasksByUser(this.currentUserEmail);

    this.applyFilters();
  }

  private applyFilters(): void {
    let f = [...this.tasks];
    const { status, priority, assignedUser } = this.filterForm.value;
    if (status) f = f.filter(t => t.status === status);
    if (priority) f = f.filter(t => t.priority === priority);
    if (assignedUser) f = f.filter(t => t.assignedUser === assignedUser);
    this.filteredTasks = this.sortTasks(f);
  }

  private sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      const cmp = this.sortField === 'priority'
        ? ({ low: 1, medium: 2, high: 3 }[a.priority] - { low: 1, medium: 2, high: 3 }[b.priority])
        : ((this.convertToDate(a.dueDate).getTime() || 0) - (this.convertToDate(b.dueDate).getTime() || 0));
      return this.sortDirection === 'asc' ? cmp : -cmp;
    });
  }

  setSort(field: 'priority' | 'dueDate'): void {
    this.sortDirection = this.sortField === field
      ? this.sortDirection === 'asc' ? 'desc' : 'asc'
      : 'asc';
    this.sortField = field;
    this.applyFilters();
  }

  markAsDone(task: Task): void {
    if (task.status !== Status.done) {
      task.status = Status.done;
      task.completedAt = new Date();
      this.taskService.updateTask(task).then(() => this.loadTasks());
    }
  }

  deleteTask(task: Task): void {
    if (this.currentUserRole === 'admin' || task.assignedUser === this.currentUserEmail) {
      this.taskService.deleteTask(task.id).then(() => this.loadTasks());
    } else {
      alert('Brak uprawnień do usunięcia tego zadania.');
    }
  }

  openAddForm(): void {
    this.editingTask = null;
    this.showForm = true;
  }

  openEditForm(task: Task): void {
    this.editingTask = task;
    this.showForm = true;
  }

  async onFormSubmit(task: Task): Promise<void> {
    if (this.editingTask) {
      await this.taskService.updateTask(task);
    } else {
      await this.taskService.addTask(task);
    }
    this.showForm = false;
    await this.loadTasks();
  }

  onFormCancel(): void {
    this.showForm = false;
  }

  convertToDate(date: Date | string | number | null): Date {
    return date ? new Date(date) : new Date(0);
  }
}
