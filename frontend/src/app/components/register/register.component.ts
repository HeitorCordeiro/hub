import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h2>Cadastro</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nome</label>
            <input
              type="text"
              id="name"
              formControlName="name"
              class="form-control"
              [class.is-invalid]="submitted && f['name'].errors"
            />
            @if (submitted && f['name'].errors) {
              <div class="invalid-feedback">
                @if (f['name'].errors['required']) { Nome é obrigatório }
              </div>
            }
          </div>
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
                @if (f['password'].errors['minlength']) { Mínimo de 6 caracteres }
              </div>
            }
          </div>
          @if (error()) {
            <div class="alert alert-danger">{{ error() }}</div>
          }
          @if (success()) {
            <div class="alert alert-success">{{ success() }}</div>
          }
          <button type="submit" [disabled]="loading()" class="btn btn-primary">
            @if (loading()) { Cadastrando... } @else { Cadastrar }
          </button>
          <p class="login-link">
            Já tem conta? <a routerLink="/login">Entrar</a>
          </p>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .register-card {
      background: white;
      padding: 2rem;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,.2);
      width: 100%;
      max-width: 400px;
    }
    .register-card h2 { text-align: center; margin-bottom: 2rem; color: #333; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: .5rem; color: #555; font-weight: 500; }
    .form-control { width: 100%; padding: .75rem; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; transition: border-color .3s; }
    .form-control:focus { outline: none; border-color: #667eea; }
    .form-control.is-invalid { border-color: #dc3545; }
    .invalid-feedback { color: #dc3545; font-size: .875rem; margin-top: .25rem; }
    .alert { padding: .75rem; margin-bottom: 1rem; border-radius: 5px; }
    .alert-danger { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .alert-success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .btn { width: 100%; padding: .75rem; border: none; border-radius: 5px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background-color .3s; }
    .btn-primary { background-color: #667eea; color: white; }
    .btn-primary:hover:not(:disabled) { background-color: #5568d3; }
    .btn:disabled { opacity: .6; cursor: not-allowed; }
    .login-link { text-align: center; margin-top: 1rem; color: #555; }
    .login-link a { color: #667eea; text-decoration: none; }
    .login-link a:hover { text-decoration: underline; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submitted = false;
  loading = signal(false);
  error = signal('');
  success = signal('');

  get f() { return this.form.controls; }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.authService.register(
      this.f['name'].value!,
      this.f['email'].value!,
      this.f['password'].value!
    ).subscribe({
      next: () => {
        this.success.set('Cadastro realizado! Redirecionando para login...');
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erro ao cadastrar. Tente novamente.');
        this.loading.set(false);
      }
    });
  }
}
