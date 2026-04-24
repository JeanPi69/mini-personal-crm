import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const runGuard = () =>
    TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

  const mockAuthService = (authenticated: boolean) => ({
    isAuthenticated: signal(authenticated),
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
      ],
    });
  });

  it('should return true when user is authenticated', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: mockAuthService(true),
    });
    const result = runGuard();
    expect(result).toBeTrue();
  });

  it('should return a UrlTree for /login when not authenticated', () => {
    TestBed.overrideProvider(AuthService, {
      useValue: mockAuthService(false),
    });
    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });
});
