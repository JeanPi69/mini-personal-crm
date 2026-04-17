import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }

  create(data: Omit<User, 'id' | 'createdAt'> & { password: string }): Observable<User> {
    const payload = { ...data, createdAt: new Date().toISOString() };
    return this.http.post<User>('/api/users', payload);
  }

  update(id: string, data: Partial<User & { password?: string }>): Observable<User> {
    return this.http.put<User>(`/api/users/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}
