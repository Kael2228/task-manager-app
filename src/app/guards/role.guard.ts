import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { FirebaseAuthService } from '../services/firebase-auth.service';

export const roleGuard = (requiredRoles: string[]): CanActivateFn => {
  return async () => {
    const authService = inject(FirebaseAuthService);
    const router = inject(Router);

    const user = await authService.getCurrentUser();

    if (user && requiredRoles.includes(user.role)) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  };
};
