import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { DealsService } from './deals.service';
import { Deal } from '../models/deal.model';

const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'Deal A',
    value: 5000,
    stage: 'lead',
    contactId: 'c1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    description: 'test',
    assignedTo: '1'
  },
  {
    id: '2',
    title: 'Deal B',
    value: 10000,
    stage: 'closed-won',
    contactId: 'c2',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
    description: 'test',
    assignedTo: '2'
  },
  {
    id: '3',
    title: 'Deal C',
    value: 3000,
    stage: 'proposal',
    contactId: 'c1',
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
    description: 'test',
    assignedTo: '1'
  },
];

describe('DealsService', () => {
  let service: DealsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(DealsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty state', () => {
    expect(service.deals()).toEqual([]);
    expect(service.totalValue()).toBe(0);
    expect(service.openDeals()).toBe(0);
  });

  describe('loadDeals()', () => {
    it('should load deals and update computed signals', () => {
      service.loadDeals();
      expect(service.loading()).toBeTrue();

      httpMock.expectOne('/api/deals').flush(mockDeals);

      expect(service.deals()).toEqual(mockDeals);
      expect(service.loading()).toBeFalse();
      expect(service.totalValue()).toBe(18000);
    });

    it('should set error on failure', () => {
      service.loadDeals();
      httpMock.expectOne('/api/deals').flush(
        { message: 'Not found' },
        { status: 404, statusText: 'Not Found' }
      );

      expect(service.error()).toBe('Not found');
      expect(service.loading()).toBeFalse();
    });
  });

  describe('computed signals after load', () => {
    beforeEach(() => {
      service.loadDeals();
      httpMock.expectOne('/api/deals').flush(mockDeals);
    });

    it('openDeals() should exclude closed-won and closed-lost', () => {
      expect(service.openDeals()).toBe(2); // lead + proposal
    });

    it('dealsByStage() should group deals correctly', () => {
      const byStage = service.dealsByStage();
      expect(byStage['lead'].length).toBe(1);
      expect(byStage['closed-won'].length).toBe(1);
      expect(byStage['proposal'].length).toBe(1);
      expect(byStage['negotiation'].length).toBe(0);
    });

    it('stageValueTotals() should sum values per stage', () => {
      const totals = service.stageValueTotals();
      const leadTotal = totals.find((s) => s.stage === 'lead');
      expect(leadTotal?.total).toBe(5000);
      expect(leadTotal?.count).toBe(1);
    });
  });

  it('update() should PUT and update deal in list', () => {
    service.loadDeals();
    httpMock.expectOne('/api/deals').flush(mockDeals);

    const updated = { ...mockDeals[0], value: 9999 };
    service.update('1', updated).subscribe();

    const req = httpMock.expectOne('/api/deals/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);

    expect(service.deals().find((d) => d.id === '1')?.value).toBe(9999);
  });

  it('delete() should DELETE and remove from list', () => {
    service.loadDeals();
    httpMock.expectOne('/api/deals').flush(mockDeals);

    service.delete('1').subscribe();

    const req = httpMock.expectOne('/api/deals/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.deals().find((d) => d.id === '1')).toBeUndefined();
    expect(service.deals().length).toBe(2);
  });
});
