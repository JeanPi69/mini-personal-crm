import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthResponse, LoginCredentials, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<User | null>(this.loadUserFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap((response) => {
        localStorage.setItem('crm_token', response.token);
        localStorage.setItem('crm_user', JSON.stringify(response.user));
        this._currentUser.set(response.user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('crm_token');
  }

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem('crm_user');
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  }
}
