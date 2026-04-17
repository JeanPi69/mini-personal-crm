import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <p class="text-8xl font-black text-gray-200">404</p>
        <h1 class="text-2xl font-bold text-gray-900 mt-2">Page not found</h1>
        <p class="text-gray-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
        <a
          routerLink="/dashboard"
          class="inline-flex items-center gap-2 mt-6 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Back to Dashboard
        </a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
