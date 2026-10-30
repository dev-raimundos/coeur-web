import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services/authentication/auth.service';
import { ToastService } from '../services/notification/toast/toast.service';
import { AuthTokenInterceptor } from './auth-token.interceptor';
import { HttpErrorInterceptor } from './http-error-toast.interceptor';

describe('Central API error notifications', () => {
    let http: HttpTestingController;
    let client: HttpClient;
    const toast = { show: vi.fn() };
    const auth = {
        getAccessToken: () => 'old-token',
        refreshAccessToken: vi.fn(),
        logout: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([HttpErrorInterceptor, AuthTokenInterceptor])),
                provideHttpClientTesting(),
                { provide: ToastService, useValue: toast },
                { provide: AuthService, useValue: auth },
            ],
        });
        client = TestBed.inject(HttpClient);
        http = TestBed.inject(HttpTestingController);
        auth.refreshAccessToken.mockImplementation(() => client.post('/api/v1/auth/refresh', {}));
    });
    afterEach(() => http.verify());

    it('uses the API message and still propagates errors to the caller', () => {
        const errorHandler = vi.fn();
        client.get('/api/v1/users').subscribe({ error: errorHandler });
        http.expectOne('/api/v1/users').flush(
            { detail: 'E-mail já cadastrado.' },
            { status: 409, statusText: 'Conflict' },
        );
        expect(toast.show).toHaveBeenCalledExactlyOnceWith('E-mail já cadastrado.', 'error');
        expect(errorHandler).toHaveBeenCalledOnce();
    });

    it('uses a fallback for invalid error bodies', () => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').flush('<html>Bad gateway</html>', {
            status: 502,
            statusText: 'Bad Gateway',
        });
        expect(toast.show).toHaveBeenCalledExactlyOnceWith(
            'Não foi possível completar a operação. Tente novamente.',
            'error',
        );
    });

    it('notifies network failures', () => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').error(new ProgressEvent('error'));
        expect(toast.show).toHaveBeenCalledExactlyOnceWith(
            'Não foi possível conectar ao servidor. Verifique sua conexão.',
            'error',
        );
    });

    it('keeps 401 silent and retries with the refreshed token', () => {
        const success = vi.fn();
        client.get('/api/v1/users').subscribe(success);
        http.expectOne('/api/v1/users').flush({}, { status: 401, statusText: 'Unauthorized' });
        expect(toast.show).not.toHaveBeenCalled();
        http.expectOne('/api/v1/auth/refresh').flush({ accessToken: 'new-token' });
        const retry = http.expectOne('/api/v1/users');
        expect(retry.request.headers.get('Authorization')).toBe('Bearer new-token');
        retry.flush([]);
        expect(success).toHaveBeenCalledOnce();
        expect(toast.show).not.toHaveBeenCalled();
    });

    it('logs out silently if refresh also returns 401', () => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').flush({}, { status: 401, statusText: 'Unauthorized' });
        http.expectOne('/api/v1/auth/refresh').flush(
            {},
            { status: 401, statusText: 'Unauthorized' },
        );
        expect(auth.logout).toHaveBeenCalledOnce();
        expect(toast.show).not.toHaveBeenCalled();
    });

    it('reports a server error during refresh only once', () => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').flush({}, { status: 401, statusText: 'Unauthorized' });
        http.expectOne('/api/v1/auth/refresh').flush(
            { detail: 'Serviço indisponível.' },
            { status: 503, statusText: 'Unavailable' },
        );
        expect(toast.show).toHaveBeenCalledExactlyOnceWith('Serviço indisponível.', 'error');
    });
});
