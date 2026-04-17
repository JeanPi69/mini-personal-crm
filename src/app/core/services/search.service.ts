import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ContactsService } from './contacts.service';
import { DealsService } from './deals.service';
import { TasksService } from './tasks.service';

export interface SearchResult {
  type: 'contact' | 'deal' | 'task';
  id: string;
  label: string;
  subtitle: string;
  route: string[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly contactsService = inject(ContactsService);
  private readonly dealsService = inject(DealsService);
  private readonly tasksService = inject(TasksService);

  readonly query = signal('');

  private readonly debouncedQuery = toSignal(
    toObservable(this.query).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' }
  );

  readonly results = computed((): SearchResult[] => {
    const q = (this.debouncedQuery() ?? '').toLowerCase().trim();
    if (q.length < 2) return [];

    const contacts: SearchResult[] = this.contactsService
      .contacts()
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((c) => ({
        type: 'contact',
        id: c.id,
        label: c.name,
        subtitle: c.company,
        route: ['/contacts', c.id],
      }));

    const deals: SearchResult[] = this.dealsService
      .deals()
      .filter((d) => d.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map((d) => ({
        type: 'deal',
        id: d.id,
        label: d.title,
        subtitle: `$${d.value.toLocaleString()} · ${d.stage}`,
        route: ['/deals', d.id, 'edit'],
      }));

    const tasks: SearchResult[] = this.tasksService
      .tasks()
      .filter((t) => t.title.toLowerCase().includes(q))
      .slice(0, 3)
      .map((t) => ({
        type: 'task',
        id: t.id,
        label: t.title,
        subtitle: t.status,
        route: ['/tasks', t.id, 'edit'],
      }));

    return [...contacts, ...deals, ...tasks].slice(0, 8);
  });

  readonly hasResults = computed(() => this.results().length > 0);
}
