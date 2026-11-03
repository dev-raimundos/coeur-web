import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/authentication/auth.service';
import { ToastService } from '../services/notification/toast/toast.service';
import { AuthTokenInterceptor } from './auth-token.interceptor';
import { errorInterceptor } from './error.interceptor';

describe('Central API error notifications', () => {
    let http: HttpTestingController;
    let client: HttpClient;
    const toast = { show: vi.fn(), error: vi.fn() };
    const router = { url: '/usuarios', navigate: vi.fn() };
    const auth = {
        getAccessToken: () => 'old-token',
        refreshAccessToken: vi.fn(),
        logout: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([errorInterceptor, AuthTokenInterceptor])),
                provideHttpClientTesting(),
                { provide: ToastService, useValue: toast },
                { provide: Router, useValue: router },
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
            status: 400,
            statusText: 'Bad Request',
        });
        expect(toast.show).toHaveBeenCalledExactlyOnceWith(
            'Não foi possível completar a operação. Tente novamente.',
            'error',
        );
    });

    it('opens the offline page on network failures', () => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').error(new ProgressEvent('error'));
        expect(router.navigate).toHaveBeenCalledExactlyOnceWith(['/offline'], {
            state: { returnUrl: '/usuarios' },
            replaceUrl: true,
        });
        expect(toast.show).not.toHaveBeenCalled();
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
        expect(router.navigate).toHaveBeenCalledExactlyOnceWith(['/internal-error'], {
            replaceUrl: true,
        });
        expect(auth.logout).not.toHaveBeenCalled();
        expect(toast.show).not.toHaveBeenCalled();
    });
    it('opens offline without logging out when refresh gets no response', () => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').flush({}, { status: 401, statusText: 'Unauthorized' });
        http.expectOne('/api/v1/auth/refresh').error(new ProgressEvent('error'));
        expect(router.navigate).toHaveBeenCalledExactlyOnceWith(['/offline'], {
            state: { returnUrl: '/usuarios' },
            replaceUrl: true,
        });
        expect(auth.logout).not.toHaveBeenCalled();
        expect(toast.show).not.toHaveBeenCalled();
    });

    it('keeps a login 401 silent without attempting refresh', () => {
        client.post('/api/v1/auth/login', {}).subscribe({ error: () => {} });
        http.expectOne('/api/v1/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
        expect(auth.refreshAccessToken).not.toHaveBeenCalled();
        expect(toast.error).not.toHaveBeenCalled();
        expect(toast.show).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it.each([500, 502, 503])('opens the error page for status %s', (status) => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').flush({}, { status, statusText: 'Server Error' });
        expect(router.navigate).toHaveBeenCalledExactlyOnceWith(['/internal-error'], {
            replaceUrl: true,
        });
        expect(toast.show).not.toHaveBeenCalled();
    });

    it('opens the forbidden page for 403', () => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').flush({}, { status: 403, statusText: 'Forbidden' });
        expect(router.navigate).toHaveBeenCalledExactlyOnceWith(['/403']);
    });

    it.each([
        [404, {}, 'Recurso não encontrado.'],
        [404, { message: 'Usuário não encontrado.' }, 'Usuário não encontrado.'],
        [422, { errors: { email: ['E-mail inválido.'] } }, 'E-mail inválido.'],
        [422, {}, 'Dados inválidos. Verifique os campos.'],
        [422, { errors: { email: null } }, 'Dados inválidos. Verifique os campos.'],
        [429, {}, 'Muitas tentativas. Aguarde alguns instantes.'],
    ])('notifies status %s with an appropriate message', (status, body, message) => {
        client.get('/api/v1/users').subscribe({ error: () => {} });
        http.expectOne('/api/v1/users').flush(body, { status, statusText: 'Error' });
        expect(toast.error).toHaveBeenCalledExactlyOnceWith(message);
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it.each([0, 403, 500])('does not redirect silent requests with status %s', (status) => {
        client
            .get('/api/v1/users', { headers: { 'X-Silent': 'true' } })
            .subscribe({ error: () => {} });
        const request = http.expectOne('/api/v1/users');
        if (status === 0) request.error(new ProgressEvent('error'));
        else request.flush({}, { status, statusText: 'Error' });
        expect(router.navigate).not.toHaveBeenCalled();
        expect(toast.error).not.toHaveBeenCalled();
        expect(toast.show).not.toHaveBeenCalled();
    });
});
