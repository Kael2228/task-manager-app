import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  CollectionReference,
  DocumentData,
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
  private tasksCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.tasksCollection = collection(this.firestore, 'tasks');
  }

  async getTasks(): Promise<Task[]> {
    const snapshot = await getDocs(this.tasksCollection);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Task & { dueDate: Timestamp | null; completedAt?: Timestamp | null };

      return {
        ...data,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        completedAt: data.completedAt ? data.completedAt.toDate() : null
      };
    });
  }

  async getTasksByUser(email: string): Promise<Task[]> {
    const q = query(this.tasksCollection, where('assignedUser', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data() as Task & { dueDate: Timestamp | null; completedAt?: Timestamp | null };

      return {
        ...data,
        dueDate: data.dueDate ? data.dueDate.toDate() : null,
        completedAt: data.completedAt ? data.completedAt.toDate() : null
      };
    });
  }

  async addTask(task: Task): Promise<void> {
    const id = uuidv4();
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await setDoc(doc(this.tasksCollection, id), newTask);
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
