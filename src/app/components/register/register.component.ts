import { Component, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';


const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ]
})

export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private ngZone = inject(NgZone);

  registerForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
    role: ['user', Validators.required],
  }, { validators: passwordMatchValidator });

  errorMessage = '';
  successMessage = '';

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) return;

    const { username, email, password, role } = this.registerForm.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      if (!userCredential.user) throw new Error('User not found after registration');

      await updateProfile(userCredential.user, { displayName: username });

      await setDoc(doc(this.firestore, 'users', userCredential.user.uid), {
        username,
        email,
        role,
        createdAt: serverTimestamp()
      });

      this.ngZone.run(() => {
        this.successMessage = 'Rejestracja zakończona. Możesz się teraz zalogować.';
        this.errorMessage = '';
        this.registerForm.reset({ role: 'user' });

        setTimeout(() => this.router.navigate(['/login']), 2000);
      });
    } catch (error: any) {
      this.ngZone.run(() => {
        this.errorMessage = this.getErrorMessage(error.code || '');
        this.successMessage = '';
      });
      console.error(error);
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Użytkownik z tym adresem email już istnieje.';
      case 'auth/invalid-email':
        return 'Nieprawidłowy adres email.';
      case 'auth/weak-password':
        return 'Hasło jest zbyt słabe.';
      default:
        return 'Wystąpił nieznany błąd.';
    }
  }
}
