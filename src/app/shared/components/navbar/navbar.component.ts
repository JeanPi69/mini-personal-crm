import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      <!-- Left: menu toggle -->
      <button
        (click)="toggleSidebar.emit()"
        class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Right: user info + logout -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-gray-800">{{ user()?.name }}</p>
          <p class="text-xs text-gray-500 capitalize">{{ user()?.role }}</p>
        </div>
        <div
          class="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm"
        >
          {{ user()?.avatar }}
        </div>
        <button
          (click)="logout()"
          class="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label="Logout"
          title="Logout"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  readonly toggleSidebar = output<void>();

  private readonly auth = inject(AuthService);
  readonly user = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
  }
}
