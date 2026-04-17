import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Deal, DealFormValue, DealStage } from '../models/deal.model';

@Injectable({ providedIn: 'root' })
export class DealsService {
  private readonly http = inject(HttpClient);

  private readonly _deals = signal<Deal[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly deals = this._deals.asReadonly();

  readonly totalValue = computed(() =>
    this._deals().reduce((sum, d) => sum + d.value, 0)
  );

  readonly openDeals = computed(
    () => this._deals().filter((d) => d.stage !== 'closed-won' && d.stage !== 'closed-lost').length
  );

  readonly dealsByStage = computed(() => {
    const stages: DealStage[] = ['lead', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
    return stages.reduce(
      (acc, stage) => {
        acc[stage] = this._deals().filter((d) => d.stage === stage);
        return acc;
      },
      {} as Record<DealStage, Deal[]>
    );
  });

  readonly stageValueTotals = computed(() => {
    const groups = this.dealsByStage();
    return Object.entries(groups).map(([stage, deals]) => ({
      stage: stage as DealStage,
      total: deals.reduce((s, d) => s + d.value, 0),
      count: deals.length,
    }));
  });

  loadDeals(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<Deal[]>('/api/deals').subscribe({
      next: (data) => {
        this._deals.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Failed to load deals');
        this.loading.set(false);
      },
    });
  }

  getById(id: string): Observable<Deal> {
    return this.http.get<Deal>(`/api/deals/${id}`);
  }

  getByContactId(contactId: string): Observable<Deal[]> {
    return this.http.get<Deal[]>(`/api/deals?contactId=${contactId}`);
  }

  create(data: DealFormValue): Observable<Deal> {
    const now = new Date().toISOString();
    const payload = { ...data, createdAt: now, updatedAt: now };
    return this.http.post<Deal>('/api/deals', payload).pipe(
      tap((created) => this._deals.update((list) => [...list, created]))
    );
  }

  update(id: string, data: Partial<Deal>): Observable<Deal> {
    const payload = { ...data, updatedAt: new Date().toISOString() };
    return this.http.put<Deal>(`/api/deals/${id}`, payload).pipe(
      tap((updated) =>
        this._deals.update((list) => list.map((d) => (d.id === id ? updated : d)))
      )
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/deals/${id}`).pipe(
      tap(() => this._deals.update((list) => list.filter((d) => d.id !== id)))
    );
  }
}
