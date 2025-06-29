import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task, Priority, Status } from '../../models/task.model';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@firebase/firestore';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-task-form',
  standalone: true,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ]
})
export class TaskFormComponent implements OnInit {
  @Input() taskToEdit: Task | null = null;
  @Output() formSubmit = new EventEmitter<Task>();
  @Output() formCancel = new EventEmitter<void>();

  taskForm: FormGroup;

  priorities = ['low', 'medium', 'high'] as Priority[];
  statuses = ['todo', 'in_progress', 'done'] as Status[];

  currentUserEmail = '';

  constructor(private fb: FormBuilder, private authService: FirebaseAuthService) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['medium', Validators.required],
      status: ['todo', Validators.required],
      dueDate: ['', Validators.required],
      assignedUser: [''],
      tags: [''],
      attachments: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    const currentUser = await this.authService.getCurrentUser();
    this.currentUserEmail = currentUser?.email || '';

    if (this.taskToEdit) {
      this.populateForm(this.taskToEdit);
    } else {
      this.taskForm.patchValue({ assignedUser: this.currentUserEmail });
    }
  }

  private convertToDateString(date: Date | Timestamp | null): string {
    if (!date) return '';
    if ((date as Timestamp).toDate) {
      return (date as Timestamp).toDate().toISOString().substring(0, 10);
    }
    return (date as Date).toISOString().substring(0, 10);
  }

  populateForm(task: Task): void {
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: this.convertToDateString(task.dueDate),
      assignedUser: task.assignedUser,
      tags: task.tags.join(', '),
      attachments: task.attachments.join(', ')
    });
  }

private convertToDate(value: Date | Timestamp | null | undefined): Date | null {
  if (!value) return null;
  return (value as Timestamp).toDate ? (value as Timestamp).toDate() : (value as Date);
}

onSubmit(): void {
  if (this.taskForm.invalid) return;

  const formValue = this.taskForm.value;

  const newTask: Task = {
    id: this.taskToEdit ? this.taskToEdit.id : Date.now().toString(),
    title: formValue.title,
    description: formValue.description,
    priority: formValue.priority,
    status: formValue.status,
    dueDate: formValue.dueDate ? new Date(formValue.dueDate) : null,
    createdAt: this.convertToDate(this.taskToEdit?.createdAt) || new Date(),
    updatedAt: new Date(),
    tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : [],
    assignedUser: formValue.assignedUser || this.currentUserEmail,
    attachments: formValue.attachments ? formValue.attachments.split(',').map((a: string) => a.trim()) : [],
    completedAt: this.convertToDate(this.taskToEdit?.completedAt) || null
  };

  this.formSubmit.emit(newTask);
}


  onCancel(): void {
    this.formCancel.emit();
  }

  get title() {
    return this.taskForm.get('title');
  }

  get dueDate() {
    return this.taskForm.get('dueDate');
  }
}
