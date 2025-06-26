import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { from, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: FirebaseAuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return from(this.authService.getCurrentUser()).pipe(
      map(user => {
        if (user && user.role === 'admin') {
          return true;
        }
        return this.router.parseUrl('/dashboard');
      })
    );
  }
}
