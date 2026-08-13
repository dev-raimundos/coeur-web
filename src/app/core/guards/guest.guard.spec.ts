import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

import { guestGuard } from './guest.guard';
import { AuthService } from '../services/authentication/auth.service';

describe('guestGuard', () => {
    let router: Router;
    let isLoggedIn: ReturnType<typeof signal<boolean>>;

    beforeEach(() => {
        isLoggedIn = signal(false);

        TestBed.configureTestingModule({
            providers: [{ provide: AuthService, useValue: { isLoggedIn } }],
        });

        router = TestBed.inject(Router);
        vi.spyOn(router, 'navigate').mockResolvedValue(true);
    });

    function run() {
        return TestBed.runInInjectionContext(() =>
            guestGuard({} as never, { url: '/login' } as never),
        );
    }

    it('should allow access when the user is not logged in', () => {
        expect(run()).toBe(true);
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to /dashboard and deny access when the user is already logged in', () => {
        isLoggedIn.set(true);

        expect(run()).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
});
