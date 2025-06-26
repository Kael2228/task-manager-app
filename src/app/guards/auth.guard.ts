import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: FirebaseAuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    // Używamy getCurrentUser() asynchronicznie - tutaj wymaga zmiany na async
    // albo synchronizujemy innym sposobem
    // Ale jeśli chcesz wersję synchronizowaną i masz metodę isLoggedIn(), zdefiniuj ją w serwisie
    
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      return this.router.parseUrl('/login');
    }
  }
}
