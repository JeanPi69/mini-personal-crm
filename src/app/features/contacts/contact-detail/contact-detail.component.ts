import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactsService } from '../../../core/services/contacts.service';
import { DealsService } from '../../../core/services/deals.service';
import { TasksService } from '../../../core/services/tasks.service';
import { NotesService } from '../../../core/services/notes.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Contact } from '../../../core/models/contact.model';
import { Deal } from '../../../core/models/deal.model';
import { Task } from '../../../core/models/task.model';
import { Note } from '../../../core/models/note.model';
import { DatePipe, DecimalPipe } from '@angular/common';

type Tab = 'deals' | 'tasks' | 'notes';

@Component({
  selector: 'app-contact-detail',
  imports: [RouterLink, ReactiveFormsModule, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      <!-- Back -->
      <a routerLink="/contacts" class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Contacts
      </a>

      @if (loading()) {
        <div class="flex items-center justify-center py-16">
          <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      } @else if (contact()) {
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <!-- Contact card -->
          <div class="xl:col-span-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6 space-y-5">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xl">
                {{ contact()!.name.charAt(0) }}
              </div>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">{{ contact()!.name }}</h1>
                <p class="text-gray-500 dark:text-gray-300 text-sm">{{ contact()!.company }}</p>
              </div>
            </div>

            <div class="space-y-3 text-sm">
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                {{ contact()!.email }}
              </div>
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                {{ contact()!.phone || '—' }}
              </div>
            </div>

            <div>
              <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getStatusClass(contact()!.status)">
                {{ contact()!.status }}
              </span>
            </div>

            <div class="pt-2 border-t border-gray-100">
              <a
                [routerLink]="['/contacts', contact()!.id, 'edit']"
                class="block w-full text-center px-4 py-2 text-sm font-medium text-primary-600 dark:text-white border border-primary-200 hover:bg-primary-50 dark:hover:bg-primary-700 dark:bg-primary-600 rounded-lg transition-colors"
              >
                Edit Contact
              </a>
            </div>
          </div>

          <!-- Tabs -->
          <div class="xl:col-span-2 space-y-4">
            <!-- Tab bar -->
            <div class="flex border-b border-gray-200 dark:border-gray-700">
              @for (tab of tabs; track tab.id) {
                <button
                  (click)="activeTab.set(tab.id)"
                  class="px-5 py-2.5 text-sm font-medium border-b-2 transition-colors"
                  [class]="activeTab() === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                >
                  {{ tab.label }}
                  <span class="ml-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-1.5 py-0.5">
                    {{ tab.count() }}
                  </span>
                </button>
              }
            </div>

            <!-- Deals tab -->
            @if (activeTab() === 'deals') {
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                @if (deals().length === 0) {
                  <p class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">No deals yet.</p>
                }
                @for (deal of deals(); track deal.id) {
                  <div class="flex items-center justify-between px-5 py-3">
                    <div>
                      <p class="font-medium text-sm text-gray-900 dark:text-white">{{ deal.title }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">\${{ deal.value | number: '1.0-0' }}</p>
                    </div>
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getStageClass(deal.stage)">
                      {{ deal.stage }}
                    </span>
                  </div>
                }
              </div>
            }

            <!-- Tasks tab -->
            @if (activeTab() === 'tasks') {
              <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                @if (tasks().length === 0) {
                  <p class="text-center text-sm text-gray-500 dark:text-gray-400 py-10">No tasks yet.</p>
                }
                @for (task of tasks(); track task.id) {
                  <div class="flex items-center justify-between px-5 py-3">
                    <div>
                      <p class="font-medium text-sm text-gray-900 dark:text-white">{{ task.title }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">Due: {{ task.dueDate | date: 'mediumDate' }}</p>
                    </div>
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getTaskStatusClass(task.status)">
                      {{ task.status }}
                    </span>
                  </div>
                }
              </div>
            }

            <!-- Notes tab -->
            @if (activeTab() === 'notes') {
              <div class="space-y-3">
                <!-- Add note form -->
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <form [formGroup]="noteForm" (ngSubmit)="addNote()">
                    <textarea
                      formControlName="content"
                      rows="3"
                      placeholder="Add a note..."
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    ></textarea>
                    <div class="flex justify-end mt-2">
                      <button
                        type="submit"
                        [disabled]="noteForm.invalid"
                        class="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Notes list -->
                <div class="space-y-2">
                  @for (note of notes(); track note.id) {
                    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                      <p class="text-sm text-gray-700 dark:text-gray-200">{{ note.content }}</p>
                      <div class="flex items-center justify-between mt-2">
                        <p class="text-xs text-gray-400 dark:text-gray-500">{{ note.createdAt | date: 'medium' }}</p>
                        <button (click)="deleteNote(note.id)" class="text-xs text-red-400 hover:text-red-600">Delete</button>
                      </div>
                    </div>
                  } @empty {
                    <p class="text-center text-sm text-gray-500 dark:text-gray-400 py-6">No notes yet.</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class ContactDetailComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly contactsService = inject(ContactsService);
  private readonly dealsService = inject(DealsService);
  private readonly tasksService = inject(TasksService);
  private readonly notesService = inject(NotesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly contact = signal<Contact | null>(null);
  readonly deals = signal<Deal[]>([]);
  readonly tasks = signal<Task[]>([]);
  readonly notes = signal<Note[]>([]);
  readonly activeTab = signal<Tab>('deals');

  readonly noteForm = this.fb.nonNullable.group({
    content: ['', Validators.required],
  });

  readonly tabs = [
    { id: 'deals' as Tab, label: 'Deals', count: () => this.deals().length },
    { id: 'tasks' as Tab, label: 'Tasks', count: () => this.tasks().length },
    { id: 'notes' as Tab, label: 'Notes', count: () => this.notes().length },
  ];

  ngOnInit(): void {
    this.contactsService.getById(this.id()).subscribe({
      next: (c) => {
        this.contact.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.dealsService.getByContactId(this.id()).subscribe((d) => this.deals.set(d));
    this.tasksService.getByContactId(this.id()).subscribe((t) => this.tasks.set(t));
    this.notesService.getByContactId(this.id()).subscribe((n) => this.notes.set(n));
  }

  addNote(): void {
    if (this.noteForm.invalid) return;
    this.notesService
      .create({
        content: this.noteForm.getRawValue().content,
        contactId: this.id(),
        createdBy: this.auth.currentUser()?.id ?? '',
      })
      .subscribe({
        next: (note) => {
          this.notes.update((list) => [note, ...list]);
          this.noteForm.reset();
        },
        error: () => this.toast.error('Failed to save note.'),
      });
  }

  deleteNote(noteId: string): void {
    this.notesService.delete(noteId).subscribe({
      next: () => this.notes.update((list) => list.filter((n) => n.id !== noteId)),
      error: () => this.toast.error('Failed to delete note.'),
    });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      prospect: 'bg-blue-100 text-blue-700',
      inactive: 'bg-gray-100 text-gray-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  getStageClass(stage: string): string {
    const map: Record<string, string> = {
      lead: 'bg-blue-100 text-blue-700',
      proposal: 'bg-amber-100 text-amber-700',
      negotiation: 'bg-orange-100 text-orange-700',
      'closed-won': 'bg-emerald-100 text-emerald-700',
      'closed-lost': 'bg-red-100 text-red-700',
    };
    return map[stage] ?? 'bg-gray-100 text-gray-600';
  }

  getTaskStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      completed: 'bg-emerald-100 text-emerald-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
