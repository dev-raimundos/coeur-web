import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
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
        request.flush({ content: [], totalElements: 0 });
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
});
