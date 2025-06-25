import { Component, OnInit } from '@angular/core';
import { Task, Priority, Status } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TaskFormComponent } from '../task-form/task-form.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TaskFormComponent]
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

  editingTask: Task | null = null;
  showForm = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      priority: [''],
      assignedUser: ['']
    });
  }

  ngOnInit(): void {
    this.currentUserEmail = this.authService.getCurrentUser()?.email || '';
    this.loadTasks();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadTasks(): void {
    const allTasks = this.taskService.getTasks();
    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.role === 'admin') {
      this.tasks = allTasks;
    } else {
      this.tasks = allTasks.filter(t => t.assignedUser === currentUser?.email);
    }

    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.tasks];
    const { status, priority, assignedUser } = this.filterForm.value;

    if (status) {
      filtered = filtered.filter(t => t.status === status as Status);
    }
    if (priority) {
      filtered = filtered.filter(t => t.priority === priority as Priority);
    }
    if (assignedUser) {
      filtered = filtered.filter(t => t.assignedUser === assignedUser);
    }

    this.filteredTasks = this.sortTasks(filtered);
  }

  sortTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => {
      let compare = 0;
      if (this.sortField === 'priority') {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        compare = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (this.sortField === 'dueDate') {
        compare = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return this.sortDirection === 'asc' ? compare : -compare;
    });
  }

  setSort(field: 'priority' | 'dueDate'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  markAsDone(task: Task): void {
    if (task.status !== Status.done) {
      task.status = Status.done;
      task.completedAt = new Date();
      this.taskService.updateTask(task);
      this.loadTasks();
    }
  }

  deleteTask(task: Task): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.role === 'admin' || task.assignedUser === currentUser?.email) {
      this.taskService.deleteTask(task.id);
      this.loadTasks();
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

  onFormSubmit(task: Task): void {
    if (this.editingTask) {
      this.taskService.updateTask(task);
    } else {
      this.taskService.addTask(task);
    }
    this.showForm = false;
    this.loadTasks();
  }

  onFormCancel(): void {
    this.showForm = false;
  }
}
