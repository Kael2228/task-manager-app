import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor() {}

  getTasks(): Task[] {
    const tasksJson = localStorage.getItem('tasks');
    return tasksJson ? JSON.parse(tasksJson) : [];
  }

  getTaskById(id: string): Task | undefined {
    return this.getTasks().find(task => task.id === id);
  }

  addTask(task: Task): void {
    const tasks = this.getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  updateTask(updatedTask: Task): void {
    const tasks = this.getTasks();
    const index = tasks.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter(task => task.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}
