import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactsService } from '../../core/services/contacts.service';
import { DealsService } from '../../core/services/deals.service';
import { TasksService } from '../../core/services/tasks.service';
import { AuthService } from '../../core/services/auth.service';
import { DEAL_STAGES } from '../../core/models/deal.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-500 text-sm mt-0.5">Welcome back, {{ user()?.name }}</p>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
          <div class="p-2.5 bg-primary-50 rounded-lg">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ totalContacts() }}</p>
            <p class="text-sm text-gray-500">Total Contacts</p>
            <p class="text-xs text-emerald-600 mt-0.5">{{ activeContacts() }} active</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
          <div class="p-2.5 bg-amber-50 rounded-lg">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">\${{ totalValue() | number: '1.0-0' }}</p>
            <p class="text-sm text-gray-500">Pipeline Value</p>
            <p class="text-xs text-amber-600 mt-0.5">{{ openDeals() }} open deals</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
          <div class="p-2.5 bg-rose-50 rounded-lg">
            <svg class="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ pendingTasks() }}</p>
            <p class="text-sm text-gray-500">Pending Tasks</p>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4">
          <div class="p-2.5 bg-emerald-50 rounded-lg">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">{{ wonDeals() }}</p>
            <p class="text-sm text-gray-500">Deals Won</p>
            <p class="text-xs text-emerald-600 mt-0.5">\${{ wonValue() | number: '1.0-0' }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Recent contacts -->
        <div class="xl:col-span-2 bg-white rounded-xl border border-gray-200">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">Recent Contacts</h2>
            <a routerLink="/contacts" class="text-sm text-primary-600 hover:underline">View all</a>
          </div>
          <div class="divide-y divide-gray-50">
            @for (contact of recentContacts(); track contact.id) {
              <a
                [routerLink]="['/contacts', contact.id]"
                class="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                  {{ contact.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ contact.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ contact.company }}</p>
                </div>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  [class]="getStatusClass(contact.status)"
                >
                  {{ contact.status }}
                </span>
              </a>
            } @empty {
              <p class="text-sm text-gray-500 px-5 py-8 text-center">No contacts yet.</p>
            }
          </div>
        </div>

        <!-- Deals by stage -->
        <div class="bg-white rounded-xl border border-gray-200">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 class="font-semibold text-gray-900">Deals by Stage</h2>
            <a routerLink="/deals" class="text-sm text-primary-600 hover:underline">Board</a>
          </div>
          <div class="px-5 py-4 space-y-4">
            @for (stage of stageStats(); track stage.stage) {
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-700">{{ stage.label }}</span>
                  <span class="text-xs font-medium text-gray-500">{{ stage.count }} · \${{ stage.total | number: '1.0-0' }}</span>
                </div>
                <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [class]="stage.colorClass"
                    [style.width]="stage.percentage + '%'"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly contacts = inject(ContactsService);
  private readonly deals = inject(DealsService);
  private readonly tasks = inject(TasksService);
  private readonly auth = inject(AuthService);

  readonly user = this.auth.currentUser;
  readonly totalContacts = this.contacts.totalContacts;
  readonly activeContacts = this.contacts.activeContacts;
  readonly recentContacts = this.contacts.recentContacts;
  readonly totalValue = this.deals.totalValue;
  readonly openDeals = this.deals.openDeals;
  readonly pendingTasks = this.tasks.pendingTasks;

  readonly wonDeals = computed(
    () => this.deals.deals().filter((d) => d.stage === 'closed-won').length
  );
  readonly wonValue = computed(() =>
    this.deals.deals().filter((d) => d.stage === 'closed-won').reduce((s, d) => s + d.value, 0)
  );

  private readonly stageColors: Record<string, string> = {
    lead: 'bg-blue-400',
    proposal: 'bg-amber-400',
    negotiation: 'bg-orange-400',
    'closed-won': 'bg-emerald-500',
    'closed-lost': 'bg-red-400',
  };

  private readonly stageLabels: Record<string, string> = {
    lead: 'Lead',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    'closed-won': 'Closed Won',
    'closed-lost': 'Closed Lost',
  };

  readonly stageStats = computed(() => {
    const totals = this.deals.stageValueTotals();
    const max = Math.max(...totals.map((s) => s.total), 1);
    return totals.map((s) => ({
      ...s,
      label: this.stageLabels[s.stage],
      colorClass: this.stageColors[s.stage],
      percentage: Math.round((s.total / max) * 100),
    }));
  });

  ngOnInit(): void {
    this.contacts.loadContacts();
    this.deals.loadDeals();
    this.tasks.loadTasks();
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      prospect: 'bg-blue-100 text-blue-700',
      inactive: 'bg-gray-100 text-gray-600',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }
}
