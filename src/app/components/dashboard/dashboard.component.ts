import { Component, OnInit, OnDestroy } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private userSub?: Subscription;

  constructor(private authService: FirebaseAuthService, private router: Router) {}

  ngOnInit(): void {
    // Subskrybuj zmiany aktualnego użytkownika
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    // Odsubskrybuj aby uniknąć wycieków pamięci
    this.userSub?.unsubscribe();
  }

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
