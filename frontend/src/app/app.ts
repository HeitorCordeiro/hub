import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  template: `
    <nav class="navbar">
      <div class="navbar-content">
        <a routerLink="/resources" class="navbar-brand">Hub de Recursos Educacionais</a>
        <div class="navbar-right">
          @if (authService.currentUserValue) {
            <span class="user-name">{{ authService.currentUserValue.name }}</span>
            <button class="btn btn-logout" (click)="logout()">Sair</button>
          } @else {
            <a routerLink="/login" class="btn btn-login">Entrar</a>
          }
        </div>
      </div>
    </nav>
    <router-outlet />
  `,
  styles: [`
    .navbar {
      background: #667eea;      
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }
    .navbar-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .navbar-brand { margin: 0; font-size: 1.5rem; font-weight: 700; color: white; text-decoration: none; }
    .navbar-brand:hover { opacity: .9; }
    .navbar-right { display: flex; align-items: center; gap: 1rem; }
    .user-name { font-size: .9rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 5px; cursor: pointer; font-weight: 500; font-size: 0.875rem; transition: opacity .2s; text-decoration: none; display: inline-block; }
    .btn:hover { opacity: 0.85; }
    .btn-logout { background: rgba(255,255,255,.2); color: white; }
    .btn-login { background: rgba(255,255,255,.2); color: white; }
  `]
})
export class App {
  authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/resources']);
  }
}
