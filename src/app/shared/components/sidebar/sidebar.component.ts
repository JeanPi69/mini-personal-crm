import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
  { label: 'Contacts', path: '/contacts', icon: 'contacts' },
  { label: 'Deals', path: '/deals', icon: 'deals' },
  { label: 'Tasks', path: '/tasks', icon: 'tasks' },
  { label: 'Users', path: '/admin/users', icon: 'users', adminOnly: true },
];

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside
      class="flex flex-col bg-gray-900 text-white transition-all duration-300 shrink-0 min-h-screen"
      [style.width]="collapsed() ? '64px' : '220px'"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-4 py-5 border-b border-gray-700 min-h-[64px]">
        <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
        </div>
        @if (!collapsed()) {
          <span class="font-bold text-sm tracking-wide truncate">Mini CRM</span>
        }
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 py-4 space-y-1 px-2">
        @for (item of visibleNavItems(); track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-primary-600 text-white"
            [routerLinkActiveOptions]="{ exact: item.path === '/dashboard' }"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors group"
          >
            <span class="shrink-0 w-5 h-5 flex items-center justify-center">
              @switch (item.icon) {
                @case ('dashboard') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                }
                @case ('contacts') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                }
                @case ('deals') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                }
                @case ('tasks') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                }
                @case ('users') {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                }
              }
            </span>
            @if (!collapsed()) {
              <span class="text-sm font-medium truncate">{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <!-- Collapse toggle -->
      <button
        (click)="toggleCollapse.emit()"
        class="flex items-center justify-center p-4 border-t border-gray-700 text-gray-400 hover:text-white transition-colors"
      >
        <svg
          class="w-5 h-5 transition-transform duration-300"
          [class.rotate-180]="collapsed()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  `,
})
export class SidebarComponent {
  readonly collapsed = input(false);
  readonly toggleCollapse = output<void>();

  private readonly auth = inject(AuthService);
  readonly isAdmin = this.auth.isAdmin;

  readonly visibleNavItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.adminOnly || this.isAdmin())
  );
}
