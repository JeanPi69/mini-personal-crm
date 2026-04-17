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
import { ContactsService } from '../../../core/services/contacts.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ContactStatus } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <a routerLink="/contacts" class="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ isEdit() ? 'Edit Contact' : 'New Contact' }}</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ isEdit() ? 'Update contact information' : 'Add a new contact to your CRM' }}</p>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                formControlName="name"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                [class.border-red-400]="isInvalid('name')"
              />
              @if (isInvalid('name')) { <p class="text-red-500 text-xs mt-1">Name is required.</p> }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Company</label>
              <input
                type="text"
                formControlName="company"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
              <input
                type="email"
                formControlName="email"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                [class.border-red-400]="isInvalid('email')"
              />
              @if (isInvalid('email')) { <p class="text-red-500 text-xs mt-1">Valid email is required.</p> }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
              <input
                type="tel"
                formControlName="phone"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
              <select
                formControlName="status"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <a
              routerLink="/contacts"
              class="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </a>
            <button
              type="submit"
              [disabled]="loading()"
              class="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {{ loading() ? 'Saving...' : (isEdit() ? 'Save changes' : 'Create contact') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ContactFormComponent implements OnInit {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly contactsService = inject(ContactsService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly isEdit = () => !!this.id();

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    company: [''],
    status: ['prospect' as ContactStatus],
    assignedTo: [''],
  });

  ngOnInit(): void {
    this.form.patchValue({ assignedTo: this.auth.currentUser()?.id ?? '' });

    const editId = this.id();
    if (editId) {
      this.loading.set(true);
      this.contactsService.getById(editId).subscribe({
        next: (contact) => {
          this.form.patchValue(contact);
          this.loading.set(false);
        },
        error: () => {
          this.toast.error('Failed to load contact.');
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
    const data = this.form.getRawValue();

    const request = editId
      ? this.contactsService.update(editId, data)
      : this.contactsService.create(data);

    request.subscribe({
      next: () => {
        this.toast.success(editId ? 'Contact updated.' : 'Contact created.');
        this.router.navigate(['/contacts']);
      },
      error: () => {
        this.toast.error('Failed to save contact.');
        this.loading.set(false);
      },
    });
  }
}
