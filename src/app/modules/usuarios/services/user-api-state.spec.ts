import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { User } from '@shared/models/user.model';
import { DeleteUserService } from './delete-user.service';
import { UserActionsService } from './user-actions.service';
import { UserFormService } from './user-form.service';
import { UserService } from './user.service';

describe('User API state services', () => {
    const user: User = { id: '1', name: 'Ana', email: 'ana@example.com', roles: 'ROLE_USER' };
    const api = { get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() };

    beforeEach(() => {
        vi.clearAllMocks();
        TestBed.configureTestingModule({
            providers: [
                UserActionsService,
                UserFormService,
                DeleteUserService,
                { provide: UserService, useValue: api },
            ],
        });
    });

    it('tracks detail loading and clears it when the caller cancels', () => {
        const pending = new Subject<User>();
        api.get.mockReturnValue(pending);
        const state = TestBed.inject(UserActionsService);
        const subscription = state.loadUser('1').subscribe();
        expect(state.loading()).toBe(true);
        state.loadUser('1').subscribe();
        expect(api.get).toHaveBeenCalledOnce();
        subscription.unsubscribe();
        expect(state.loading()).toBe(false);
    });

    it('clears loading after a failed save and allows retry', () => {
        const state = TestBed.inject(UserFormService);
        api.update.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
        state.update(user.id, user).subscribe({ error: () => {} });
        expect(state.saving()).toBe(false);
        api.update.mockReturnValue(of(user));
        state.update(user.id, user).subscribe();
    });

    it('returns deletion results without requiring a dialog', () => {
        const state = TestBed.inject(DeleteUserService);
        const pending = new Subject<void>();
        api.delete.mockReturnValue(pending);
        const completed = vi.fn();
        state.delete('1').subscribe({ next: completed });
        expect(state.deleting()).toBe(true);
        pending.next();
        pending.complete();
        expect(completed).toHaveBeenCalledOnce();
        expect(state.deleting()).toBe(false);
    });
});
