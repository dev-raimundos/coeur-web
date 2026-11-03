import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [provideHttpClient(), provideHttpClientTesting()],
        });
        service = TestBed.inject(AuthService);
    });

    afterEach(() => {
        TestBed.inject(HttpTestingController).verify();
        localStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('preserves tokens when the profile request gets no response so offline retry can restore the session', () => {
        localStorage.setItem('coeur.accessToken', 'access-token');
        localStorage.setItem('coeur.refreshToken', 'refresh-token');
        service.fetchCurrentUser().subscribe();
        TestBed.inject(HttpTestingController)
            .expectOne('/api/v1/users/me')
            .error(new ProgressEvent('error'));
        expect(service.getAccessToken()).toBe('access-token');
        expect(service.getRefreshToken()).toBe('refresh-token');
        expect(service.isUserProfileLoading()).toBe(false);
    });

    it('clears tokens when the profile request returns 401', () => {
        localStorage.setItem('coeur.accessToken', 'access-token');
        localStorage.setItem('coeur.refreshToken', 'refresh-token');
        service.fetchCurrentUser().subscribe();
        TestBed.inject(HttpTestingController)
            .expectOne('/api/v1/users/me')
            .flush({}, { status: 401, statusText: 'Unauthorized' });
        expect(service.getAccessToken()).toBeNull();
        expect(service.getRefreshToken()).toBeNull();
        expect(service.isLoggedIn()).toBe(false);
    });
});
