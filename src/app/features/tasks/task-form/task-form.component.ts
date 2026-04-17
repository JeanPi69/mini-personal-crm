import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TasksService } from '../../../core/services/tasks.service';
import { ContactsService } from '../../../core/services/contacts.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TaskPriority, TaskStatus } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto space-y-5">
      <div class="flex items-center gap-3">
        <a routerLink="/tasks" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit() ? 'Edit Task' : 'New Task' }}</h1>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Task Title *</label>
            <input
              type="text"
              formControlName="title"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              [class.border-red-400]="isInvalid('title')"
            />
            @if (isInvalid('title')) { <p class="text-red-500 text-xs mt-1">Title is required.</p> }
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Contact *</label>
              <select
                formControlName="contactId"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                [class.border-red-400]="isInvalid('contactId')"
              >
                <option value="">Select a contact</option>
                @for (c of contacts(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
              @if (isInvalid('contactId')) { <p class="text-red-500 text-xs mt-1">Contact is required.</p> }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Due Date *</label>
              <input
                type="date"
                formControlName="dueDate"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                [class.border-red-400]="isInvalid('dueDate')"
              />
              @if (isInvalid('dueDate')) { <p class="text-red-500 text-xs mt-1">Due date is required.</p> }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                formControlName="status"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select
                formControlName="priority"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              formControlName="description"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <a routerLink="/tasks" class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </a>
            <button
              type="submit"
              [disabled]="loading()"
              class="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {{ loading() ? 'Saving...' : (isEdit() ? 'Save changes' : 'Create task') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class TaskFormComponent implements OnInit {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly tasksService = inject(TasksService);
  private readonly contactsService = inject(ContactsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly isEdit = () => !!this.id();
  readonly contacts = this.contactsService.contacts;

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    contactId: ['', Validators.required],
    dealId: [null as string | null],
    dueDate: ['', Validators.required],
    status: ['pending' as TaskStatus],
    priority: ['medium' as TaskPriority],
    description: [''],
    assignedTo: [''],
  });

  ngOnInit(): void {
    this.form.patchValue({ assignedTo: this.auth.currentUser()?.id ?? '' });
    this.contactsService.loadContacts();

    const editId = this.id();
    if (editId) {
      this.loading.set(true);
      this.tasksService.getById(editId).subscribe({
        next: (task) => {
          const dueDate = task.dueDate ? task.dueDate.split('T')[0] : '';
          this.form.patchValue({ ...task, dueDate });
          this.loading.set(false);
        },
        error: () => {
          this.toast.error('Failed to load task.');
          this.loading.set(false);
        },
      });
    }
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && ctrl.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const editId = this.id();
    const raw = this.form.getRawValue();
    const data = { ...raw, dueDate: new Date(raw.dueDate).toISOString() };

    const request = editId
      ? this.tasksService.update(editId, data)
      : this.tasksService.create(data);

    request.subscribe({
      next: () => {
        this.toast.success(editId ? 'Task updated.' : 'Task created.');
        this.router.navigate(['/tasks']);
      },
      error: () => {
        this.toast.error('Failed to save task.');
        this.loading.set(false);
      },
    });
  }
}
