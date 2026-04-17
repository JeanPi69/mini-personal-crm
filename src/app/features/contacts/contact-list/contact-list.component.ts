import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactsService } from '../../../core/services/contacts.service';
import { ToastService } from '../../../core/services/toast.service';
import { Contact, ContactStatus } from '../../../core/models/contact.model';

@Component({
  selector: 'app-contact-list',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{{ contacts.totalContacts() }} total</p>
        </div>
        <a
          routerLink="/contacts/new"
          class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Contact
        </a>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-3">
        <input
          type="text"
          [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)"
          placeholder="Search by name, email or company..."
          class="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        <select
          [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="prospect">Prospect</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <!-- Table -->
      <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        @if (contacts.loading()) {
          <div class="flex items-center justify-center py-16">
            <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        } @else if (filteredContacts().length === 0) {
          <div class="text-center py-16">
            <p class="text-gray-500 text-sm">No contacts found.</p>
            <a routerLink="/contacts/new" class="text-primary-600 text-sm hover:underline mt-1 inline-block">Add one</a>
          </div>
        } @else {
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th class="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Name</th>
                <th class="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300 hidden md:table-cell">Company</th>
                <th class="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300 hidden lg:table-cell">Email</th>
                <th class="text-left px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th class="text-right px-5 py-3 font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              @for (contact of filteredContacts(); track contact.id) {
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-5 py-3">
                    <a [routerLink]="['/contacts', contact.id]" class="flex items-center gap-3 group">
                      <div class="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs shrink-0">
                        {{ contact.name.charAt(0) }}
                      </div>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ contact.name }}</p>
                        <p class="text-gray-500 dark:text-gray-400 text-xs">{{ contact.phone }}</p>
                      </div>
                    </a>
                  </td>
                  <td class="px-5 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{{ contact.company }}</td>
                  <td class="px-5 py-3 text-gray-600 dark:text-gray-300 hidden lg:table-cell">{{ contact.email }}</td>
                  <td class="px-5 py-3">
                    <span class="text-xs px-2 py-0.5 rounded-full font-medium" [class]="getStatusClass(contact.status)">
                      {{ contact.status }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right">
                    <div class="inline-flex items-center gap-1">
                      <a
                        [routerLink]="['/contacts', contact.id, 'edit']"
                        class="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button
                        (click)="confirmDelete(contact)"
                        class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
      </div>

      <!-- Delete confirmation dialog -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg">Delete Contact</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">
              Are you sure you want to delete <strong>{{ deleteTarget()!.name }}</strong>?
              This action cannot be undone.
            </p>
            <div class="flex justify-end gap-3 mt-5">
              <button
                (click)="deleteTarget.set(null)"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                (click)="deleteContact()"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ContactListComponent implements OnInit {
  readonly contacts = inject(ContactsService);
  private readonly toast = inject(ToastService);

  readonly searchQuery = signal('');
  readonly statusFilter = signal<ContactStatus | ''>('');
  readonly deleteTarget = signal<Contact | null>(null);

  readonly filteredContacts = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const s = this.statusFilter();
    return this.contacts.contacts().filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q);
      const matchesStatus = !s || c.status === s;
      return matchesSearch && matchesStatus;
    });
  });

  ngOnInit(): void {
    this.contacts.loadContacts();
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      prospect: 'bg-blue-100 text-blue-700',
      inactive: 'bg-gray-100 text-gray-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  confirmDelete(contact: Contact): void {
    this.deleteTarget.set(contact);
  }

  deleteContact(): void {
    const contact = this.deleteTarget();
    if (!contact) return;
    this.contacts.delete(contact.id).subscribe({
      next: () => {
        this.toast.success(`${contact.name} deleted.`);
        this.deleteTarget.set(null);
      },
      error: () => this.toast.error('Failed to delete contact.'),
    });
  }
}
