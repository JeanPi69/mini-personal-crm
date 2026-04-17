import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterNextRender,
  computed,
  effect,
  inject,
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContactsService } from '../../core/services/contacts.service';
import { DealsService } from '../../core/services/deals.service';
import { TasksService } from '../../core/services/tasks.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { DecimalPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Page header -->
      <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Welcome back, {{ user()?.name }}</p>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
          <div class="p-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            <svg class="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalContacts() }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Contacts</p>
            <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{{ activeContacts() }} active</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
          <div class="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
            <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">\${{ totalValue() | number: '1.0-0' }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Pipeline Value</p>
            <p class="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{{ openDeals() }} open deals</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
          <div class="p-2.5 bg-rose-50 dark:bg-rose-900/30 rounded-lg">
            <svg class="w-6 h-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pendingTasks() }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-start gap-4">
          <div class="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
            <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ wonDeals() }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Deals Won</p>
            <p class="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">\${{ wonValue() | number: '1.0-0' }}</p>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-4">Pipeline by Stage</h2>
          <div class="relative h-52">
            <canvas #pipelineChart></canvas>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 class="font-semibold text-gray-900 dark:text-white mb-4">Tasks by Status</h2>
          <div class="relative h-52">
            <canvas #tasksChart></canvas>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <!-- Recent contacts -->
        <div class="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 class="font-semibold text-gray-900 dark:text-white">Recent Contacts</h2>
            <a routerLink="/contacts" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">View all</a>
          </div>
          <div class="divide-y divide-gray-50">
            @for (contact of recentContacts(); track contact.id) {
              <a
                [routerLink]="['/contacts', contact.id]"
                class="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div class="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                  {{ contact.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ contact.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ contact.company }}</p>
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
        <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 class="font-semibold text-gray-900 dark:text-white">Deals by Stage</h2>
            <a routerLink="/deals" class="text-sm text-primary-600 dark:text-primary-400 hover:underline">Board</a>
          </div>
          <div class="px-5 py-4 space-y-4">
            @for (stage of stageStats(); track stage.stage) {
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ stage.label }}</span>
                  <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ stage.count }} · \${{ stage.total | number: '1.0-0' }}</span>
                </div>
                <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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
  private readonly theme = inject(ThemeService);

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

  private readonly pipelineChartRef = viewChild<ElementRef<HTMLCanvasElement>>('pipelineChart');
  private readonly tasksChartRef = viewChild<ElementRef<HTMLCanvasElement>>('tasksChart');
  private pipelineChart: Chart | null = null;
  private tasksChart: Chart | null = null;

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

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.initCharts();
    });

    effect(() => {
      const stageData = this.stageStats();
      const taskData = this.tasks.tasksByStatus();
      const isDark = this.theme.isDark();
      untracked(() => this.updateCharts(stageData, taskData, isDark));
    });

    destroyRef.onDestroy(() => {
      this.pipelineChart?.destroy();
      this.tasksChart?.destroy();
    });
  }

  ngOnInit(): void {
    this.contacts.loadContacts();
    this.deals.loadDeals();
    this.tasks.loadTasks();
  }

  private chartColors(isDark: boolean) {
    return {
      grid: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      label: isDark ? '#9ca3af' : '#6b7280',
    };
  }

  private initCharts(): void {
    const pipelineEl = this.pipelineChartRef()?.nativeElement;
    const tasksEl = this.tasksChartRef()?.nativeElement;
    if (!pipelineEl || !tasksEl) return;

    const isDark = this.theme.isDark();
    const { grid, label } = this.chartColors(isDark);
    const stages = this.stageStats();

    this.pipelineChart = new Chart(pipelineEl, {
      type: 'bar',
      data: {
        labels: stages.map((s) => s.label),
        datasets: [
          {
            label: 'Value ($)',
            data: stages.map((s) => s.total),
            backgroundColor: ['#60a5fa', '#fbbf24', '#fb923c', '#34d399', '#f87171'],
            borderRadius: 6,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            grid: { color: grid },
            ticks: { color: label, maxTicksLimit: 5 },
          },
          x: {
            grid: { display: false },
            ticks: { color: label },
          },
        },
      },
    });

    const tasksByStatus = this.tasks.tasksByStatus();
    this.tasksChart = new Chart(tasksEl, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Completed'],
        datasets: [
          {
            data: [
              tasksByStatus['pending'].length,
              tasksByStatus['in-progress'].length,
              tasksByStatus['completed'].length,
            ],
            backgroundColor: ['#fbbf24', '#60a5fa', '#34d399'],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: label, boxWidth: 12, padding: 12 },
          },
        },
      },
    });
  }

  private updateCharts(
    stages: ReturnType<DashboardComponent['stageStats']>,
    tasksByStatus: ReturnType<TasksService['tasksByStatus']>,
    isDark: boolean
  ): void {
    const { grid, label } = this.chartColors(isDark);

    if (this.pipelineChart) {
      this.pipelineChart.data.datasets[0].data = stages.map((s) => s.total);
      const yScale = this.pipelineChart.options.scales?.['y'];
      const xScale = this.pipelineChart.options.scales?.['x'];
      if (yScale) {
        yScale.grid = { color: grid };
        yScale.ticks = { color: label, maxTicksLimit: 5 };
      }
      if (xScale) xScale.ticks = { color: label };
      this.pipelineChart.update();
    }

    if (this.tasksChart) {
      this.tasksChart.data.datasets[0].data = [
        tasksByStatus['pending'].length,
        tasksByStatus['in-progress'].length,
        tasksByStatus['completed'].length,
      ];
      const legendLabels = this.tasksChart.options.plugins?.legend?.labels;
      if (legendLabels) legendLabels.color = label;
      this.tasksChart.update();
    }
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
