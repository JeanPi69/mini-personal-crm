import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthService } from './auth.service';
import { AuthResponse, User } from '../models/user.model';

const mockUser: User = { id: '1', name: 'Alice', email: 'alice@test.com', role: 'user', avatar: '', createdAt: '2024-01-01T00:00:00.000Z' };
const mockAdminUser: User = { id: '2', name: 'Admin', email: 'admin@test.com', role: 'admin', avatar: '', createdAt: '2024-01-01T00:00:00.000Z' };
const mockResponse: AuthResponse = { token: 'tok123', user: mockUser };

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated when localStorage is empty', () => {
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.currentUser()).toBeNull();
  });

  it('should load user from localStorage on init', () => {
    localStorage.setItem('crm_user', JSON.stringify(mockUser));
    const freshService = TestBed.runInInjectionContext(() => new AuthService());
    expect(freshService.currentUser()).toEqual(mockUser);
    expect(freshService.isAuthenticated()).toBeTrue();
  });

  it('login() should POST to /api/auth/login and set current user', () => {
    service.login({ email: 'alice@test.com', password: 'pass' }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(service.currentUser()).toEqual(mockUser);
    expect(service.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('crm_token')).toBe('tok123');
  });

  it('logout() should clear user and token', () => {
    localStorage.setItem('crm_token', 'tok123');
    localStorage.setItem('crm_user', JSON.stringify(mockUser));

    service.logout();

    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('crm_token')).toBeNull();
    expect(localStorage.getItem('crm_user')).toBeNull();
  });

  it('getToken() should return token from localStorage', () => {
    localStorage.setItem('crm_token', 'mytoken');
    expect(service.getToken()).toBe('mytoken');
  });

  it('getToken() should return null when no token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('isAdmin() should return true for admin users', () => {
    localStorage.setItem('crm_user', JSON.stringify(mockAdminUser));
    const freshService = TestBed.runInInjectionContext(() => new AuthService());
    expect(freshService.isAdmin()).toBeTrue();
  });

  it('isAdmin() should return false for regular users', () => {
    localStorage.setItem('crm_user', JSON.stringify(mockUser));
    const freshService = TestBed.runInInjectionContext(() => new AuthService());
    expect(freshService.isAdmin()).toBeFalse();
  });
});
