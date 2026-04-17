import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Task, TaskFormValue } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);

  private readonly _tasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly tasks = this._tasks.asReadonly();

  readonly pendingTasks = computed(
    () => this._tasks().filter((t) => t.status === 'pending' || t.status === 'in-progress').length
  );

  readonly tasksByStatus = computed(() => ({
    pending: this._tasks().filter((t) => t.status === 'pending'),
    'in-progress': this._tasks().filter((t) => t.status === 'in-progress'),
    completed: this._tasks().filter((t) => t.status === 'completed'),
  }));

  loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Task[]>('/api/tasks').subscribe({
      next: (data) => {
        this._tasks.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to load tasks');
        this.loading.set(false);
      },
    });
  }

  getById(id: string): Observable<Task> {
    return this.http.get<Task>(`/api/tasks/${id}`);
  }

  getByContactId(contactId: string): Observable<Task[]> {
    return this.http.get<Task[]>(`/api/tasks?contactId=${contactId}`);
  }

  create(data: TaskFormValue): Observable<Task> {
    const payload = { ...data, createdAt: new Date().toISOString() };
    return this.http.post<Task>('/api/tasks', payload).pipe(
      tap((created) => this._tasks.update((list) => [...list, created]))
    );
  }

  update(id: string, data: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`/api/tasks/${id}`, data).pipe(
      tap((updated) =>
        this._tasks.update((list) => list.map((t) => (t.id === id ? updated : t)))
      )
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/tasks/${id}`).pipe(
      tap(() => this._tasks.update((list) => list.filter((t) => t.id !== id)))
    );
  }
}
