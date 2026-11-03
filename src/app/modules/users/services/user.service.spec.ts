import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(UserService);
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());

    it('sends server pagination and sort parameters', () => {
        service.list(2, 20, 'email,desc').subscribe();
        const request = http.expectOne((req) => req.url === '/api/v1/users');
        expect(request.request.method).toBe('GET');
        expect(request.request.params.get('page')).toBe('2');
        expect(request.request.params.get('size')).toBe('20');
        expect(request.request.params.get('sort')).toBe('email,desc');
        request.flush({ content: [], totalElements: 100 });
    });

    it('stores list data and reuses pagination and sorting on refresh', () => {
        const response = { content: [], totalElements: 100 };
        service.list(2, 20, 'email,desc').subscribe();
        http.expectOne((req) => req.url === '/api/v1/users').flush(response);
        expect(service.data()).toEqual(response);
        expect(service.page()).toBe(2);
        expect(service.perPage()).toBe(20);
        expect(service.sort()).toBe('email,desc');
        service.list(service.page(), service.perPage(), service.sort()).subscribe();
        const request = http.expectOne((req) => req.url === '/api/v1/users');
        expect(request.request.params.get('page')).toBe('2');
        expect(request.request.params.get('size')).toBe('20');
        expect(request.request.params.get('sort')).toBe('email,desc');
        request.flush(response);
    });

    it('loads the last available page when deletion makes the current page invalid', () => {
        service.list(2, 10, 'name,asc').subscribe();
        http.expectOne((req) => req.params.get('page') === '2').flush({
            content: [],
            totalElements: 20,
        });
        expect(service.loading()).toBe(true);
        expect(service.page()).toBe(1);
        const response = { content: [], totalElements: 20 };
        http.expectOne((req) => req.params.get('page') === '1').flush(response);
        expect(service.data()).toEqual(response);
        expect(service.loading()).toBe(false);
    });

    it('uses the available CRUD endpoints and payloads', () => {
        service.get('user-1').subscribe();
        http.expectOne('/api/v1/users/user-1').flush({});
        const creation = { name: 'Ana', email: 'ana@example.com', password: 'secret' };
        service.create(creation).subscribe();
        const create = http.expectOne('/api/v1/users/register');
        expect(create.request.method).toBe('POST');
        expect(create.request.body).toEqual(creation);
        create.flush({});
        const changes = { name: 'Ana Silva', email: 'ana@example.com', roles: 'ROLE_USER' };
        service.update('user-1', changes).subscribe();
        const update = http.expectOne('/api/v1/users/user-1');
        expect(update.request.method).toBe('PUT');
        expect(update.request.body).toEqual(changes);
        update.flush({});
        service.delete('user-1').subscribe();
        const deletion = http.expectOne('/api/v1/users/user-1');
        expect(deletion.request.method).toBe('DELETE');
        deletion.flush(null, { status: 204, statusText: 'No Content' });
    });
    it('clears loading after failure and allows retry', () => {
        service.list(0, 10, 'name,asc').subscribe({ error: () => {} });
        expect(service.loading()).toBe(true);
        http.expectOne((req) => req.url === '/api/v1/users').flush('failed', {
            status: 500,
            statusText: 'Error',
        });
        expect(service.loading()).toBe(false);
        service.list(0, 10, 'name,asc').subscribe();
        http.expectOne((req) => req.url === '/api/v1/users').flush({
            content: [],
            totalElements: 0,
        });
        expect(service.loading()).toBe(false);
    });

    it('clears loading when the caller cancels', () => {
        const subscription = service.list(0, 10, 'name,asc').subscribe();
        const request = http.expectOne((req) => req.url === '/api/v1/users');
        subscription.unsubscribe();
        expect(request.cancelled).toBe(true);
        expect(service.loading()).toBe(false);
    });
});
