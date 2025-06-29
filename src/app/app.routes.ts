import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/task-list/task-list.component').then(m => m.TaskListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/new',
    loadComponent: () => import('./components/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'tasks/edit/:id',
    loadComponent: () => import('./components/task-form/task-form.component').then(m => m.TaskFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
  path: 'home',
  loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
  },

  { path: '**', redirectTo: 'home' }
];
