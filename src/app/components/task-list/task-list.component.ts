import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

import { Task, Priority, Status } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];

  filterForm: FormGroup;
  showForm = false;
  editingTask: Task | null = null;

  priorities = Object.values(Priority);
  statuses = Object.values(Status);

  sortField: 'priority' | 'dueDate' = 'priority';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private taskService: TaskService, private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      status: [''],
      priority: [''],
      assignedUser: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadTasks();
    this.filterForm.valueChanges.subscribe(() => this.applyFiltersAndSorting());
  }

  async loadTasks(): Promise<void> {
    this.tasks = await this.taskService.getTasks();
    this.applyFiltersAndSorting();
  }

  applyFiltersAndSorting(): void {
    const { status, priority, assignedUser } = this.filterForm.value;

    this.filteredTasks = this.tasks
      .filter(task => {
        const statusMatch = !status || task.status === status;
        const priorityMatch = !priority || task.priority === priority;
        const userMatch = !assignedUser || task.assignedUser?.includes(assignedUser);
        return statusMatch && priorityMatch && userMatch;
      })
      .sort((a, b) => this.compareTasks(a, b));
  }

  compareTasks(a: Task, b: Task): number {
    let compare = 0;

    if (this.sortField === 'priority') {
      const order = { low: 1, medium: 2, high: 3 };
      compare = order[a.priority] - order[b.priority];
    } else if (this.sortField === 'dueDate') {
      const dateA = this.convertToDate(a.dueDate);
      const dateB = this.convertToDate(b.dueDate);
      compare = (dateA?.getTime() || 0) - (dateB?.getTime() || 0);
    }

    return this.sortDirection === 'asc' ? compare : -compare;
  }

  convertToDate(date: Date | Timestamp | null): Date | null {
    if (!date) return null;
    return date instanceof Timestamp ? date.toDate() : date;
  }

  setSort(field: 'priority' | 'dueDate'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applyFiltersAndSorting();
  }

  async onFormSubmit(task: Task): Promise<void> {
    if (this.editingTask) {
      await this.taskService.updateTask(task);
    } else {
      await this.taskService.addTask(task);
    }
    this.showForm = false;
    this.editingTask = null;
    await this.loadTasks();
  }

  onFormCancel(): void {
    this.showForm = false;
    this.editingTask = null;
  }

  openAddForm(): void {
    this.showForm = true;
    this.editingTask = null;
  }

  openEditForm(task: Task): void {
    this.showForm = true;
    this.editingTask = task;
  }

  async deleteTask(task: Task): Promise<void> {
    await this.taskService.deleteTask(task.id);
    await this.loadTasks();
  }

  async markAsDone(task: Task): Promise<void> {
    const updatedTask: Task = {
      ...task,
      status: Status.done,
      completedAt: new Date()
    };
    await this.taskService.updateTask(updatedTask);
    await this.loadTasks();
  }
  
}
