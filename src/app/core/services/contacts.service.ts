import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Contact, ContactFormValue } from '../models/contact.model';

@Injectable({ providedIn: 'root' })
export class ContactsService {
  private readonly http = inject(HttpClient);

  private readonly _contacts = signal<Contact[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly contacts = this._contacts.asReadonly();
  readonly totalContacts = computed(() => this._contacts().length);
  readonly activeContacts = computed(
    () => this._contacts().filter((c) => c.status === 'active').length
  );
  readonly recentContacts = computed(() =>
    [...this._contacts()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  loadContacts(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Contact[]>('/api/contacts').subscribe({
      next: (data) => {
        this._contacts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to load contacts');
        this.loading.set(false);
      },
    });
  }

  getById(id: string): Observable<Contact> {
    return this.http.get<Contact>(`/api/contacts/${id}`);
  }

  create(data: ContactFormValue): Observable<Contact> {
    const payload = { ...data, createdAt: new Date().toISOString() };
    return this.http.post<Contact>('/api/contacts', payload).pipe(
      tap((created) => this._contacts.update((list) => [...list, created]))
    );
  }

  update(id: string, data: Partial<ContactFormValue>): Observable<Contact> {
    return this.http.put<Contact>(`/api/contacts/${id}`, data).pipe(
      tap((updated) =>
        this._contacts.update((list) => list.map((c) => (c.id === id ? updated : c)))
      )
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/contacts/${id}`).pipe(
      tap(() => this._contacts.update((list) => list.filter((c) => c.id !== id)))
    );
  }
}
