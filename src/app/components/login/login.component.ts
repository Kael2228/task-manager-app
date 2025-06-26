import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Nieprawidłowy email lub hasło.';
      case 'auth/invalid-email':
        return 'Nieprawidłowy adres email.';
      default:
        return 'Wystąpił błąd logowania.';
    }
  }
}
