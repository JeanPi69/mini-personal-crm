import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CdkDropList,
  CdkDrag,
  CdkDropListGroup,
  CdkDragDrop,
  transferArrayItem,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { DealsService } from '../../../core/services/deals.service';
import { ContactsService } from '../../../core/services/contacts.service';
import { ToastService } from '../../../core/services/toast.service';
import { Deal, DealStage } from '../../../core/models/deal.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-deal-board',
  imports: [RouterLink, DecimalPipe, CdkDropListGroup, CdkDropList, CdkDrag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Deals</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Pipeline value: <strong>\${{ dealsService.totalValue() | number: '1.0-0' }}</strong>
          </p>
        </div>
        <a
          routerLink="/deals/new"
          class="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Deal
        </a>
      </div>

      <!-- Kanban board -->
      @if (dealsService.loading()) {
        <div class="flex items-center justify-center py-16">
          <svg class="animate-spin h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
        </div>
      } @else {
        <div cdkDropListGroup class="flex gap-4 overflow-x-auto pb-4">
          @for (stage of stages; track stage.value) {
            <div class="flex-shrink-0 w-64">
              <!-- Column header -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full" [class]="stage.dotClass"></span>
                  <span class="text-sm font-semibold text-gray-700 dark:text-gray-200">{{ stage.label }}</span>
                </div>
                <span class="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full px-2 py-0.5">
                  {{ (boardState()[stage.value] ?? []).length }}
                </span>
              </div>

              <!-- Stage value -->
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
                \${{ stageTotal(stage.value) | number: '1.0-0' }}
              </p>

              <!-- Drop zone -->
              <div
                cdkDropList
                [id]="stage.value"
                [cdkDropListData]="boardState()[stage.value] ?? []"
                (cdkDropListDropped)="onDrop($event)"
                class="space-y-2 min-h-[100px] rounded-lg p-1 transition-colors"
              >
                @for (deal of boardState()[stage.value] ?? []; track deal.id) {
                  <div
                    cdkDrag
                    [cdkDragData]="deal"
                    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                  >
                    <div class="flex items-start justify-between gap-2 mb-2">
                      <p class="font-medium text-sm text-gray-900 dark:text-white leading-tight">{{ deal.title }}</p>
                      <div class="flex gap-1 shrink-0">
                        <a
                          [routerLink]="['/deals', deal.id, 'edit']"
                          class="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                          title="Edit"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </a>
                        <button
                          (click)="confirmDelete(deal)"
                          class="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p class="text-base font-bold text-gray-900 dark:text-white">\${{ deal.value | number: '1.0-0' }}</p>

                    @if (getContactName(deal.contactId); as name) {
                      <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">{{ name }}</p>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }

      <!-- Delete dialog -->
      @if (deleteTarget()) {
        <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h3 class="font-bold text-gray-900 dark:text-white text-lg">Delete Deal</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm mt-2">
              Are you sure you want to delete <strong>{{ deleteTarget()!.title }}</strong>?
            </p>
            <div class="flex justify-end gap-3 mt-5">
              <button (click)="deleteTarget.set(null)" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
              <button (click)="deleteDeal()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DealBoardComponent implements OnInit {
  readonly dealsService = inject(DealsService);
  private readonly contactsService = inject(ContactsService);
  private readonly toast = inject(ToastService);

  readonly deleteTarget = signal<Deal | null>(null);
  readonly boardState = signal<Record<DealStage, Deal[]>>({} as Record<DealStage, Deal[]>);

  readonly stages = [
    { value: 'lead' as DealStage, label: 'Lead', dotClass: 'bg-blue-400' },
    { value: 'proposal' as DealStage, label: 'Proposal', dotClass: 'bg-amber-400' },
    { value: 'negotiation' as DealStage, label: 'Negotiation', dotClass: 'bg-orange-400' },
    { value: 'closed-won' as DealStage, label: 'Closed Won', dotClass: 'bg-emerald-500' },
    { value: 'closed-lost' as DealStage, label: 'Closed Lost', dotClass: 'bg-red-400' },
  ];

  constructor() {
    effect(() => {
      const state = this.dealsService.dealsByStage();
      untracked(() => this.boardState.set(structuredClone(state)));
    });
  }

  ngOnInit(): void {
    this.dealsService.loadDeals();
    this.contactsService.loadContacts();
  }

  stageTotal(stage: DealStage): number {
    return (this.boardState()[stage] ?? []).reduce((s, d) => s + d.value, 0);
  }

  getContactName(contactId: string): string {
    return this.contactsService.contacts().find((c) => c.id === contactId)?.name ?? '';
  }

  onDrop(event: CdkDragDrop<Deal[]>): void {
    if (event.previousContainer === event.container) {
      const stage = event.container.id as DealStage;
      this.boardState.update((state) => {
        const arr = [...(state[stage] ?? [])];
        moveItemInArray(arr, event.previousIndex, event.currentIndex);
        return { ...state, [stage]: arr };
      });
      return;
    }

    const fromStage = event.previousContainer.id as DealStage;
    const toStage = event.container.id as DealStage;
    const deal = event.item.data as Deal;

    // Optimistic update
    this.boardState.update((state) => {
      const from = [...(state[fromStage] ?? [])];
      const to = [...(state[toStage] ?? [])];
      transferArrayItem(from, to, event.previousIndex, event.currentIndex);
      to[event.currentIndex] = { ...to[event.currentIndex], stage: toStage };
      return { ...state, [fromStage]: from, [toStage]: to };
    });

    // Persist to server
    this.dealsService.update(deal.id, { ...deal, stage: toStage }).subscribe({
      error: () => {
        this.boardState.set(structuredClone(this.dealsService.dealsByStage()));
        this.toast.error('Failed to move deal.');
      },
    });
  }

  confirmDelete(deal: Deal): void {
    this.deleteTarget.set(deal);
  }

  deleteDeal(): void {
    const deal = this.deleteTarget();
    if (!deal) return;
    this.dealsService.delete(deal.id).subscribe({
      next: () => {
        this.toast.success(`${deal.title} deleted.`);
        this.deleteTarget.set(null);
      },
      error: () => this.toast.error('Failed to delete deal.'),
    });
  }
}
