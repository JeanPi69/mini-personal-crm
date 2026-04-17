import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Note, NoteFormValue } from '../models/note.model';

@Injectable({ providedIn: 'root' })
export class NotesService {
  private readonly http = inject(HttpClient);

  getByContactId(contactId: string): Observable<Note[]> {
    return this.http.get<Note[]>(`/api/notes?contactId=${contactId}`);
  }

  create(data: NoteFormValue): Observable<Note> {
    const payload = { ...data, createdAt: new Date().toISOString() };
    return this.http.post<Note>('/api/notes', payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/notes/${id}`);
  }
}
