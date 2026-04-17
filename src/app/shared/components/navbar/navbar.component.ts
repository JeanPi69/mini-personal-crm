import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SearchService } from '../../../core/services/search.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 px-4 shrink-0">
      <!-- Left: menu toggle -->
      <button
        (click)="toggleSidebar.emit()"
        class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-white transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Center: global search -->
      <div class="flex-1 max-w-md relative">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
          </svg>
          <input
            type="text"
            placeholder="Search contacts, deals, tasks..."
            [value]="searchService.query()"
            (input)="searchService.query.set($any($event.target).value)"
            (focus)="isFocused.set(true)"
            (blur)="onBlur()"
            (keydown.escape)="clearSearch()"
            class="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
        </div>

        <!-- Search results dropdown -->
        @if (searchService.hasResults() && isFocused()) {
          <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-hidden">
            @for (result of searchService.results(); track result.id + result.type) {
              <a
                [routerLink]="result.route"
                (click)="clearSearch()"
                class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span class="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
                  [class]="result.type === 'contact' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : result.type === 'deal' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'">
                  {{ result.type }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ result.label }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ result.subtitle }}</p>
                </div>
              </a>
            }
          </div>
        }
      </div>

      <!-- Right: dark toggle + user info + logout -->
      <div class="flex items-center gap-3 ml-auto">
        <!-- Dark mode toggle -->
        <button
          (click)="themeService.toggle()"
          class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          [attr.aria-label]="themeService.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          @if (themeService.isDark()) {
            <!-- Sun icon -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          } @else {
            <!-- Moon icon -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            </svg>
          }
        </button>

        <div class="text-right hidden sm:block">
          <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ user()?.name }}</p>
          <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">{{ user()?.role }}</p>
        </div>
        <div class="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm shrink-0">
          {{ user()?.avatar }}
        </div>
        <button
          (click)="logout()"
          class="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

  protected readonly auth = inject(AuthService);
  protected readonly themeService = inject(ThemeService);
  protected readonly searchService = inject(SearchService);
  readonly user = this.auth.currentUser;
  readonly isFocused = signal(false);

  onBlur(): void {
    setTimeout(() => this.isFocused.set(false), 150);
  }

  clearSearch(): void {
    this.searchService.query.set('');
    this.isFocused.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}
