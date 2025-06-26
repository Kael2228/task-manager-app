import { Component, OnInit } from '@angular/core';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: FirebaseAuthService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.authService.getCurrentUser();
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
