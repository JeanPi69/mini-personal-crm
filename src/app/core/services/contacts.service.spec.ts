import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ContactsService } from './contacts.service';
import { Contact } from '../models/contact.model';

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Alice',
    email: 'alice@test.com',
    phone: '555-0001',
    company: 'ACME',
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    assignedTo: '1'
  },
  {
    id: '2',
    name: 'Bob',
    email: 'bob@test.com',
    phone: '555-0002',
    company: 'Corp',
    status: 'prospect',
    createdAt: '2024-01-02T00:00:00.000Z',
    assignedTo: '1'
  },
];

describe('ContactsService', () => {
  let service: ContactsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ContactsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty contacts and loading=false', () => {
    expect(service.contacts()).toEqual([]);
    expect(service.loading()).toBeFalse();
    expect(service.totalContacts()).toBe(0);
  });

  describe('loadContacts()', () => {
    it('should set contacts and clear loading on success', () => {
      service.loadContacts();
      expect(service.loading()).toBeTrue();

      httpMock.expectOne('/api/contacts').flush(mockContacts);

      expect(service.contacts()).toEqual(mockContacts);
      expect(service.loading()).toBeFalse();
      expect(service.totalContacts()).toBe(2);
    });

    it('should set error and clear loading on failure', () => {
      service.loadContacts();
      httpMock.expectOne('/api/contacts').flush(
        { message: 'Server error' },
        { status: 500, statusText: 'Internal Server Error' }
      );

      expect(service.contacts()).toEqual([]);
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBe('Server error');
    });
  });

  describe('computed signals', () => {
    beforeEach(() => {
      service.loadContacts();
      httpMock.expectOne('/api/contacts').flush(mockContacts);
    });

    it('activeContacts() should count only active contacts', () => {
      expect(service.activeContacts()).toBe(1);
    });

    it('recentContacts() should return up to 5, sorted by createdAt desc', () => {
      const recent = service.recentContacts();
      expect(recent.length).toBeLessThanOrEqual(5);
      expect(recent[0].id).toBe('2'); // newer date first
    });
  });

  it('create() should POST and append to list', () => {
    const newContact = { ...mockContacts[0], id: '3', name: 'Carol' };
    service.create({ name: 'Carol', email: 'carol@test.com', phone: '', company: '', status: 'active' as const, assignedTo: '1' }).subscribe();

    const req = httpMock.expectOne('/api/contacts');
    expect(req.request.method).toBe('POST');
    req.flush(newContact);

    expect(service.contacts()).toContain(newContact);
  });

  it('update() should PUT and update in list', () => {
    service.loadContacts();
    httpMock.expectOne('/api/contacts').flush(mockContacts);

    const updated = { ...mockContacts[0], name: 'Alice Updated' };
    service.update('1', { name: 'Alice Updated' }).subscribe();

    const req = httpMock.expectOne('/api/contacts/1');
    expect(req.request.method).toBe('PUT');
    req.flush(updated);

    expect(service.contacts().find((c) => c.id === '1')?.name).toBe('Alice Updated');
  });

  it('delete() should DELETE and remove from list', () => {
    service.loadContacts();
    httpMock.expectOne('/api/contacts').flush(mockContacts);

    service.delete('1').subscribe();

    const req = httpMock.expectOne('/api/contacts/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.contacts().find((c) => c.id === '1')).toBeUndefined();
    expect(service.contacts().length).toBe(1);
  });
});
