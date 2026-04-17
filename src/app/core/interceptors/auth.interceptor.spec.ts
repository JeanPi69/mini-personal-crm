import { TestBed } from '@angular/core/testing';
import { provideHttpClient, HttpRequest, HttpHandlerFn, HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';

describe('authInterceptor', () => {
  const runInterceptor = (req: HttpRequest<unknown>, token: string | null) => {
    const mockAuthService = { getToken: () => token };
    TestBed.overrideProvider(AuthService, { useValue: mockAuthService });

    let capturedReq: HttpRequest<unknown> | undefined;
    const mockNext: HttpHandlerFn = (r) => {
      capturedReq = r as HttpRequest<unknown>;
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => authInterceptor(req, mockNext));
    return capturedReq;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  it('should add Authorization header for /api requests when token exists', () => {
    const req = new HttpRequest('GET', '/api/contacts');
    const result = runInterceptor(req, 'mytoken');
    expect(result?.headers.get('Authorization')).toBe('Bearer mytoken');
  });

  it('should NOT add Authorization header when no token', () => {
    const req = new HttpRequest('GET', '/api/contacts');
    const result = runInterceptor(req, null);
    expect(result?.headers.get('Authorization')).toBeNull();
  });

  it('should NOT add Authorization header for non-API requests', () => {
    const req = new HttpRequest('GET', '/assets/logo.png');
    const result = runInterceptor(req, 'mytoken');
    expect(result?.headers.get('Authorization')).toBeNull();
  });

  it('should pass through the original request URL unchanged', () => {
    const req = new HttpRequest('GET', '/api/deals');
    const result = runInterceptor(req, 'tok');
    expect(result?.url).toBe('/api/deals');
  });
});
