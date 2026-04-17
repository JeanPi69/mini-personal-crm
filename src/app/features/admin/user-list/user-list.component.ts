import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../../core/services/users.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Users</h1>
          <p class="text-sm text-gray-500 mt-0.5">Manage team members and roles</p>
        </div>
        <a
          routerLink="/admin/users/new"
          class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New User
        </a>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center py-16">
            <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
          </div>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-5 py-3 font-medium text-gray-600">User</th>
                <th class="text-left px-5 py-3 font-medium text-gray-600 hidden sm:table-cell">Email</th>
                <th class="text-left px-5 py-3 font-medium text-gray-600">Role</th>
                <th class="text-right px-5 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs shrink-0">
                        {{ user.avatar }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ user.name }}</p>
                        @if (user.id === currentUser()?.id) {
                          <span class="text-xs text-primary-600">(you)</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-3 text-gray-600 hidden sm:table-cell">{{ user.email }}</td>
                  <td class="px-5 py-3">
                    <span
                      class="text-xs px-2 py-0.5 rounded-full font-medium"
                      [class]="user.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'"
                    >
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <div class="inline-flex items-center gap-1">
                      <a
                        [routerLink]="['/admin/users', user.id, 'edit']"
                        class="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </a>
                      @if (user.id !== currentUser()?.id) {
                        <button
                          (click)="confirmDelete(user)"
                          class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Delete dialog -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 class="font-bold text-gray-900 text-lg">Delete User</h3>
            <p class="text-gray-600 text-sm mt-2">Delete <strong>{{ deleteTarget()!.name }}</strong>?</p>
            <div class="flex justify-end gap-3 mt-5">
              <button (click)="deleteTarget.set(null)" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button (click)="deleteUser()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  readonly currentUser = this.auth.currentUser;
  readonly users = signal<User[]>([]);
  readonly loading = signal(true);
  readonly deleteTarget = signal<User | null>(null);

  ngOnInit(): void {
    this.usersService.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  confirmDelete(user: User): void {
    this.deleteTarget.set(user);
  }

  deleteUser(): void {
    const user = this.deleteTarget();
    if (!user) return;
    this.usersService.delete(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== user.id));
        this.toast.success(`${user.name} deleted.`);
        this.deleteTarget.set(null);
      },
      error: () => this.toast.error('Failed to delete user.'),
    });
  }
}
