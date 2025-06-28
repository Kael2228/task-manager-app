import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  Timestamp
} from '@angular/fire/firestore';
import { Task } from '../models/task.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksCollection;

  constructor(private firestore: Firestore) {
    this.tasksCollection = collection(this.firestore, 'tasks');
  }

  async getAllTasks(): Promise<Task[]> {
    const snapshot = await getDocs(this.tasksCollection);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data() as Task & { dueDate: Timestamp | null; completedAt?: Timestamp | null };
      return {
        ...(data as any),
        id: docSnap.id,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        completedAt: data.completedAt ? data.completedAt.toDate() : null
      };
    });
  }

  async getTasksByUser(email: string): Promise<Task[]> {
    console.log('Fetching tasks for user:', email);
    const q = query(this.tasksCollection, where('assignedUser', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => {
      const data = docSnap.data() as Task & { dueDate: Timestamp | null; completedAt?: Timestamp | null };
      return {
        ...(data as any),
        id: docSnap.id,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        completedAt: data.completedAt ? data.completedAt.toDate() : null
      };
    });
  }

  async addTask(task: Task): Promise<void> {
    const id = uuidv4();
    await setDoc(doc(this.tasksCollection, id), {
      ...task,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async updateTask(task: Task): Promise<void> {
    const ref = doc(this.tasksCollection, task.id);
    await updateDoc(ref, {
      ...task,
      updatedAt: new Date()
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(this.tasksCollection, taskId));
  }
}
