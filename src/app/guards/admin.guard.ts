import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { from, Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    const user = this.auth.currentUser;

    if (!user) {
      return of(this.router.parseUrl('/login'));
    }

    return from(getDoc(doc(this.firestore, 'users', user.uid))).pipe(
      map(snapshot => {
        const data = snapshot.data();
        const role = data?.['role'];

        if (role === 'admin') {
          return true;
        } else {
          return this.router.parseUrl('/dashboard');
        }
      })
    );
  }
}
