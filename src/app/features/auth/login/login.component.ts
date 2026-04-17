import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo / Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4 shadow-lg">
            <svg class="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white">Mini CRM</h1>
          <p class="text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <!-- Card -->
        <div class="bg-white rounded-2xl shadow-2xl p-8">
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-1.5" for="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                formControlName="email"
                autocomplete="email"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                [class.border-red-400]="emailInvalid()"
                placeholder="you@example.com"
              />
              @if (emailInvalid()) {
                <p class="text-red-500 text-xs mt-1">Please enter a valid email.</p>
              }
            </div>

            <!-- Password -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1.5" for="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                [class.border-red-400]="passwordInvalid()"
                placeholder="••••••••"
              />
              @if (passwordInvalid()) {
                <p class="text-red-500 text-xs mt-1">Password is required.</p>
              }
            </div>

            <!-- Error message -->
            @if (errorMessage()) {
              <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p class="text-red-600 text-sm">{{ errorMessage() }}</p>
              </div>
            }

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              @if (loading()) {
                <span class="inline-flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              } @else {
                Sign in
              }
            </button>
          </form>

          <!-- Demo credentials -->
          <div class="mt-6 pt-6 border-t border-gray-100">
            <p class="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wide">Demo credentials</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                (click)="fillDemo('admin')"
                class="text-xs bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg p-2.5 text-left transition-colors"
              >
                <span class="font-semibold text-gray-700 block">Admin</span>
                <span class="text-gray-500">admin&#64;crm.com</span>
              </button>
              <button
                (click)="fillDemo('user')"
                class="text-xs bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg p-2.5 text-left transition-colors"
              >
                <span class="font-semibold text-gray-700 block">User</span>
                <span class="text-gray-500">user&#64;crm.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  emailInvalid = () =>
    this.form.controls.email.invalid && this.form.controls.email.touched;
  passwordInvalid = () =>
    this.form.controls.password.invalid && this.form.controls.password.touched;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message ?? 'Login failed. Please try again.');
      },
    });
  }

  fillDemo(role: 'admin' | 'user'): void {
    const creds =
      role === 'admin'
        ? { email: 'admin@crm.com', password: 'admin123' }
        : { email: 'user@crm.com', password: 'user123' };
    this.form.setValue(creds);
  }
}
