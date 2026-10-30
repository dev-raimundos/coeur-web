import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/services/authentication/auth.service';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { of, Subject, throwError } from 'rxjs';
import { User } from '@shared/models/user.model';
import { UserListComponent } from './user-list.component';
import { UserActionsService } from '../../services/user-actions.service';
import { UserService } from '../../services/user.service';

describe('UserListComponent', () => {
    const user: User = { id: '1', name: 'Ana', email: 'ana@example.com', roles: 'ROLE_USER' };
    const api = {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
    const dialog = { open: vi.fn() };
    const auth = {
        currentUser: signal<User | null>(null),
        logout: vi.fn(),
        fetchCurrentUser: vi.fn(),
    };
    let actions: UserListComponent;

    beforeEach(() => {
        vi.clearAllMocks();
        api.get.mockReturnValue(of(user));
        api.list.mockReturnValue(of({ content: [user], totalElements: 1 }));
        api.create.mockReturnValue(of(user));
        api.update.mockReturnValue(of(user));
        api.delete.mockReturnValue(of(undefined));
        dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
        auth.currentUser.set(null);
        auth.fetchCurrentUser.mockReturnValue(of(user));
        TestBed.configureTestingModule({
            imports: [UserListComponent],
            providers: [
                UserActionsService,
                { provide: UserService, useValue: api },
                { provide: MatDialog, useValue: dialog },
                { provide: AuthService, useValue: auth },
                { provide: ToastService, useValue: { info: vi.fn() } },
            ],
        });
        actions = TestBed.createComponent(UserListComponent).componentInstance;
    });

    it('fetches current details before editing and reloads after saving', () => {
        dialog.open.mockReturnValue({ afterClosed: () => of(user) });
        actions.open(user, 'edit');
        expect(api.get).toHaveBeenCalledWith(user.id);
        expect(dialog.open.mock.calls[0][1].data).toEqual({ mode: 'edit', user });
        expect(api.list).toHaveBeenCalledOnce();
    });

    it('prevents duplicate detail requests', () => {
        api.get.mockReturnValue(new Subject<User>());
        actions.open(user, 'details');
        actions.open(user, 'details');
        expect(api.get).toHaveBeenCalledOnce();
        expect(actions.details.loading()).toBe(true);
    });

    it('opens registration and reloads after saving', () => {
        dialog.open.mockReturnValue({
            afterClosed: () => of({ name: user.name, email: user.email, password: 'secret' }),
        });
        actions.create();
        expect(dialog.open.mock.calls[0][1].data).toEqual({ mode: 'create' });
        expect(api.list).toHaveBeenCalledOnce();
    });

    it('does not reload when deletion is cancelled', () => {
        actions.remove(user);
        expect(api.list).not.toHaveBeenCalled();
        expect(auth.logout).not.toHaveBeenCalled();
    });

    it('reloads after deleting another account', () => {
        dialog.open.mockReturnValue({ afterClosed: () => of({ id: user.id }) });
        actions.remove(user);
        expect(api.list).toHaveBeenCalledOnce();
    });

    it('logs out after deleting the current account', () => {
        auth.currentUser.set(user);
        dialog.open.mockReturnValue({ afterClosed: () => of({ id: user.id }) });
        actions.remove(user);
        expect(auth.logout).toHaveBeenCalledOnce();
    });

    it('refreshes the current profile after editing it', () => {
        auth.currentUser.set(user);
        dialog.open.mockReturnValue({ afterClosed: () => of(user) });
        actions.open(user, 'edit');
        expect(auth.fetchCurrentUser).toHaveBeenCalledOnce();
    });
    it('ignores cancelled dialogs', () => {
        for (const dto of [undefined, null]) {
            dialog.open.mockReturnValue({ afterClosed: () => of(dto) });
            actions.create();
        }
        expect(api.create).not.toHaveBeenCalled();
        expect(api.list).not.toHaveBeenCalled();
    });

    it('ignores a deletion DTO for a different user', () => {
        dialog.open.mockReturnValue({ afterClosed: () => of({ id: 'different-user' }) });
        actions.remove(user);
        expect(api.delete).not.toHaveBeenCalled();
    });

    it('does not reload or leave loading active after an API error', () => {
        api.update.mockReturnValue(throwError(() => new Error('failed')));
        dialog.open.mockReturnValue({ afterClosed: () => of(user) });
        actions.open(user, 'edit');
        expect(actions.mutation.saving()).toBe(false);
        expect(api.list).not.toHaveBeenCalled();
    });
});
