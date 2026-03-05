import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/resources', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'resources',
    loadComponent: () =>
      import('./components/resource-list/resource-list.component').then(m => m.ResourceListComponent),
  },
  {
    path: 'resources/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
  },
  {
    path: 'resources/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/resource-form/resource-form.component').then(m => m.ResourceFormComponent),
  },
  {
    path: 'resources/:id',
    loadComponent: () =>
      import('./components/resource-detail/resource-detail.component').then(m => m.ResourceDetailComponent),
  },
  { path: '**', redirectTo: '/resources' },
];
