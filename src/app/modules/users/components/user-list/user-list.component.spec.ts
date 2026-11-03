import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { finalize as finalizeRequest, of, Subject, throwError } from 'rxjs';
import { User } from '@shared/models/user.model';
import { UserListComponent } from './user-list.component';
import { UserService } from '../../services/user.service';
import { RegisterUserDTO } from '../../models/register-user.dto';
import { UpdateUserDTO } from '../../models/update-user.dto';

describe('UserListComponent', () => {
    const user: User = { id: '1', name: 'Ana', email: 'ana@example.com', roles: 'ROLE_USER' };
    const api = {
        detailsLoading: signal(false),
        page: signal(0),
        perPage: signal(10),
        sort: signal('name,asc'),
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
    const dialog = { open: vi.fn() };
    const toast = { info: vi.fn() };
    let actions: UserListComponent;

    beforeEach(() => {
        vi.clearAllMocks();
        api.detailsLoading.set(false);
        api.page.set(0);
        api.perPage.set(10);
        api.sort.set('name,asc');
        api.get.mockReturnValue(of(user));
        api.list.mockReturnValue(of({ content: [user], totalElements: 1 }));
        api.create.mockReturnValue(of(user));
        api.update.mockReturnValue(of(user));
        api.delete.mockReturnValue(of(undefined));
        dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
        TestBed.configureTestingModule({
            imports: [UserListComponent],
            providers: [
                { provide: UserService, useValue: api },
                { provide: MatDialog, useValue: dialog },
                { provide: ToastService, useValue: toast },
            ],
        });
        actions = TestBed.createComponent(UserListComponent).componentInstance;
    });

    it('uses service pagination and sorting when refreshing', () => {
        api.page.set(2);
        api.perPage.set(20);
        api.sort.set('email,desc');
        actions.refresh();
        expect(api.list).toHaveBeenCalledWith(2, 20, 'email,desc');
    });

    it('loads the requested page and resets pagination when sorting', () => {
        actions.handlePageEvent({ pageIndex: 3, pageSize: 20, length: 100 });
        expect(api.list).toHaveBeenLastCalledWith(3, 20, 'name,asc');
        actions.changeSort({ active: 'email', direction: 'desc' });
        expect(api.list).toHaveBeenLastCalledWith(0, 10, 'email,desc');
    });

    it('cancels the previous list request before refreshing', () => {
        const pending = new Subject();
        const finalize = vi.fn();
        api.list.mockReturnValue(pending.pipe(finalizeRequest(finalize)));
        actions.refresh();
        actions.refresh();
        expect(finalize).toHaveBeenCalledOnce();
    });

    it('fetches current details before editing and reloads after saving', () => {
        const dto = new UpdateUserDTO(user.name, user.email, user.roles);
        dialog.open.mockReturnValue({ afterClosed: () => of(dto) });
        actions.onEdit(user);
        expect(api.get).toHaveBeenCalledWith(user.id);
        expect(dialog.open.mock.calls[0][1].data).toEqual({ mode: 'edit', user });
        expect(api.update).toHaveBeenCalledWith(user.id, dto);
        expect(api.update.mock.calls[0][1]).toBe(dto);
        expect(api.list).toHaveBeenCalledOnce();
        expect(toast.info).toHaveBeenCalledExactlyOnceWith('Usuário atualizado.');
    });

    it('does not request details while another detail request is loading', () => {
        api.get.mockReturnValue(new Subject<User>());
        actions.onDetails(user);
        api.detailsLoading.set(true);
        actions.onDetails(user);
        expect(api.get).toHaveBeenCalledOnce();
        expect(api.detailsLoading()).toBe(true);
    });

    it('opens registration and reloads after saving', () => {
        const dto = new RegisterUserDTO(user.name, user.email, 'secret');
        dialog.open.mockReturnValue({
            afterClosed: () => of(dto),
        });
        actions.onCreate();
        expect(dialog.open.mock.calls[0][1].data).toEqual({ mode: 'create' });
        expect(api.create).toHaveBeenCalledWith(dto);
        expect(api.create.mock.calls[0][0]).toBe(dto);
        expect(api.list).toHaveBeenCalledOnce();
        expect(toast.info).toHaveBeenCalledExactlyOnceWith('Usuário criado.');
    });

    it('does not reload when deletion is cancelled', () => {
        actions.onDelete(user);
        expect(api.list).not.toHaveBeenCalled();
        expect(api.delete).not.toHaveBeenCalled();
    });

    it('notifies and reloads after deleting an account', () => {
        dialog.open.mockReturnValue({ afterClosed: () => of(true) });
        actions.onDelete(user);
        expect(api.list).toHaveBeenCalledOnce();
        expect(toast.info).toHaveBeenCalledExactlyOnceWith('Usuário excluído.');
        expect(dialog.open.mock.calls[0][1].data.content).not.toContain('sua própria conta');
    });

    it('ignores cancelled dialogs', () => {
        for (const dto of [undefined, null]) {
            dialog.open.mockReturnValue({ afterClosed: () => of(dto) });
            actions.onCreate();
        }
        expect(api.create).not.toHaveBeenCalled();
        expect(api.list).not.toHaveBeenCalled();
    });

    it('requires explicit confirmation before deleting', () => {
        dialog.open.mockReturnValue({ afterClosed: () => of(false) });
        actions.onDelete(user);
        expect(api.delete).not.toHaveBeenCalled();
    });

    it('does not reload after a failed update', () => {
        api.update.mockReturnValue(throwError(() => new Error('failed')));
        dialog.open.mockReturnValue({ afterClosed: () => of(user) });
        actions.onEdit(user);
        expect(api.list).not.toHaveBeenCalled();
        expect(toast.info).not.toHaveBeenCalled();
    });
    it('opens details with fresh data without saving or refreshing the list', () => {
        const freshUser = { ...user, name: 'Ana Silva' };
        api.get.mockReturnValue(of(freshUser));
        dialog.open.mockReturnValue({ afterClosed: () => of(user) });
        actions.onDetails(user);
        expect(dialog.open.mock.calls[0][1]).toMatchObject({
            data: { mode: 'details', user: freshUser },
            autoFocus: 'dialog',
        });
        expect(api.create).not.toHaveBeenCalled();
        expect(api.update).not.toHaveBeenCalled();
        expect(api.list).not.toHaveBeenCalled();
    });

    it('does not save or refresh after cancelling the edit dialog', () => {
        actions.onEdit(user);
        expect(api.update).not.toHaveBeenCalled();
        expect(api.list).not.toHaveBeenCalled();
    });

    it.each(['edit', 'details'] as const)(
        'does not open the %s dialog when loading the user fails',
        (mode) => {
            api.get.mockReturnValue(throwError(() => new Error('failed')));
            if (mode === 'edit') actions.onEdit(user);
            else actions.onDetails(user);
            expect(dialog.open).not.toHaveBeenCalled();
        },
    );
});
