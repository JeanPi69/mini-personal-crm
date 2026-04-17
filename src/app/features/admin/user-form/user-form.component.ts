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
import { UsersService } from '../../../core/services/users.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-lg mx-auto space-y-5">
      <div class="flex items-center gap-3">
        <a routerLink="/admin/users" class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </a>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit() ? 'Edit User' : 'New User' }}</h1>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input
              type="text"
              formControlName="name"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              [class.border-red-400]="isInvalid('name')"
            />
            @if (isInvalid('name')) { <p class="text-red-500 text-xs mt-1">Name is required.</p> }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              [class.border-red-400]="isInvalid('email')"
            />
            @if (isInvalid('email')) { <p class="text-red-500 text-xs mt-1">Valid email is required.</p> }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Password {{ isEdit() ? '(leave blank to keep current)' : '*' }}
            </label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              [class.border-red-400]="isInvalid('password')"
            />
            @if (isInvalid('password')) { <p class="text-red-500 text-xs mt-1">Password is required (min 6 chars).</p> }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              formControlName="role"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <a routerLink="/admin/users" class="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </a>
            <button
              type="submit"
              [disabled]="loading()"
              class="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-60"
            >
              {{ loading() ? 'Saving...' : (isEdit() ? 'Save changes' : 'Create user') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class UserFormComponent implements OnInit {
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly isEdit = () => !!this.id();

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    role: ['user' as UserRole],
    avatar: [''],
  });

  ngOnInit(): void {
    if (!this.isEdit()) {
      this.form.get('password')!.addValidators(Validators.required);
      this.form.get('password')!.updateValueAndValidity();
    }

    const editId = this.id();
    if (editId) {
      this.loading.set(true);
      this.usersService.getById(editId).subscribe({
        next: (user) => {
          const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
          this.form.patchValue({ ...user, avatar: user.avatar || initials, password: '' });
          this.loading.set(false);
        },
        error: () => {
          this.toast.error('Failed to load user.');
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

    // Auto-generate avatar initials if empty
    if (!raw.avatar) {
      raw.avatar = raw.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Don't send empty password on edit
    const data = editId && !raw.password ? { ...raw, password: '' } : raw;

    const request = editId
      ? this.usersService.update(editId, data)
      : this.usersService.create(data);

    request.subscribe({
      next: () => {
        this.toast.success(editId ? 'User updated.' : 'User created.');
        this.router.navigate(['/admin/users']);
      },
      error: () => {
        this.toast.error('Failed to save user.');
        this.loading.set(false);
      },
    });
  }
}
