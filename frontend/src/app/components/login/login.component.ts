import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.is-invalid]="submitted && f['email'].errors"
            />
            @if (submitted && f['email'].errors) {
              <div class="invalid-feedback">
                @if (f['email'].errors['required']) { Email é obrigatório }
                @if (f['email'].errors['email']) { Email inválido }
              </div>
            }
          </div>
          <div class="form-group">
            <label for="password">Senha</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.is-invalid]="submitted && f['password'].errors"
            />
            @if (submitted && f['password'].errors) {
              <div class="invalid-feedback">
                @if (f['password'].errors['required']) { Senha é obrigatória }
              </div>
            }
          </div>
          @if (error()) {
            <div class="alert alert-danger">{{ error() }}</div>
          }
          <button type="submit" [disabled]="loading()" class="btn btn-primary">
            @if (loading()) { Entrando... } @else { Entrar }
          </button>
          <p class="register-link">
            Não tem conta? <a routerLink="/register">Cadastre-se</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,.2);
      width: 100%;
      max-width: 400px;
    }
    .login-card h2 { text-align: center; margin-bottom: 2rem; color: #333; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: .5rem; color: #555; font-weight: 500; }
    .form-control { width: 100%; padding: .75rem; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; transition: border-color .3s; }
    .form-control:focus { outline: none; border-color: #667eea; }
    .form-control.is-invalid { border-color: #dc3545; }
    .invalid-feedback { color: #dc3545; font-size: .875rem; margin-top: .25rem; }
    .alert { padding: .75rem; margin-bottom: 1rem; border-radius: 5px; }
    .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .btn { width: 100%; padding: .75rem; border: none; border-radius: 5px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color .3s; }
    .btn-primary { background-color: #667eea; color: white; }
    .btn-primary:hover:not(:disabled) { background-color: #5568d3; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }
    .register-link { text-align: center; margin-top: 1rem; color: #555; }
    .register-link a { color: #667eea; text-decoration: none; }
    .register-link a:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submitted = false;
  loading = signal(false);
  error = signal('');

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.f['email'].value!, this.f['password'].value!).subscribe({
      next: () => this.router.navigate(['/resources']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erro ao fazer login. Tente novamente.');
        this.loading.set(false);
      }
    });
  }
}
