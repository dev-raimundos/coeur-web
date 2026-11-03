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
    const service = {
        page: signal(0),
        perPage: signal(10),
        sort: signal('name,asc'),
        list: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    };
    const dialog = { open: vi.fn() };
    const toast = { info: vi.fn() };
    let actions: UserListComponent;

    beforeEach(() => {
        vi.clearAllMocks();
        service.page.set(0);
        service.perPage.set(10);
        service.sort.set('name,asc');
        service.list.mockReturnValue(of({ content: [user], totalElements: 1 }));
        service.create.mockReturnValue(of(user));
        service.update.mockReturnValue(of(user));
        service.delete.mockReturnValue(of(undefined));
        dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
        TestBed.configureTestingModule({
            imports: [UserListComponent],
            providers: [
                { provide: UserService, useValue: service },
                { provide: MatDialog, useValue: dialog },
                { provide: ToastService, useValue: toast },
            ],
        });
        actions = TestBed.createComponent(UserListComponent).componentInstance;
    });

    it('uses service pagination and sorting when refreshing', () => {
        service.page.set(2);
        service.perPage.set(20);
        service.sort.set('email,desc');
        actions.refresh();
        expect(service.list).toHaveBeenCalledWith(2, 20, 'email,desc');
    });

    it('loads the requested page and resets pagination when sorting', () => {
        actions.handlePageEvent({ pageIndex: 3, pageSize: 20, length: 100 });
        expect(service.list).toHaveBeenLastCalledWith(3, 20, 'name,asc');
        actions.changeSort({ active: 'email', direction: 'desc' });
        expect(service.list).toHaveBeenLastCalledWith(0, 10, 'email,desc');
    });

    it('cancels the previous list request before refreshing', () => {
        const pending = new Subject();
        const finalize = vi.fn();
        service.list.mockReturnValue(pending.pipe(finalizeRequest(finalize)));
        actions.refresh();
        actions.refresh();
        expect(finalize).toHaveBeenCalledOnce();
    });

    it('opens editing with the selected user and reloads after saving', () => {
        const dto = new UpdateUserDTO(user.name, user.email, user.roles);
        dialog.open.mockReturnValue({ afterClosed: () => of(dto) });
        actions.onEdit(user);
        expect(dialog.open.mock.calls[0][1].data).toEqual({ mode: 'edit', user });
        expect(dialog.open.mock.calls[0][1].data.user).toBe(user);
        expect(service.update).toHaveBeenCalledWith(user.id, dto);
        expect(service.update.mock.calls[0][1]).toBe(dto);
        expect(service.list).toHaveBeenCalledOnce();
        expect(toast.info).toHaveBeenCalledExactlyOnceWith('Usuário atualizado.');
    });

    it('opens registration and reloads after saving', () => {
        const dto = new RegisterUserDTO(user.name, user.email, 'secret');
        dialog.open.mockReturnValue({
            afterClosed: () => of(dto),
        });
        actions.onCreate();
        expect(dialog.open.mock.calls[0][1].data).toEqual({ mode: 'create' });
        expect(service.create).toHaveBeenCalledWith(dto);
        expect(service.create.mock.calls[0][0]).toBe(dto);
        expect(service.list).toHaveBeenCalledOnce();
        expect(toast.info).toHaveBeenCalledExactlyOnceWith('Usuário criado.');
    });

    it('does not reload when deletion is cancelled', () => {
        actions.onDelete(user);
        expect(service.list).not.toHaveBeenCalled();
        expect(service.delete).not.toHaveBeenCalled();
    });

    it('notifies and reloads after deleting an account', () => {
        dialog.open.mockReturnValue({ afterClosed: () => of(true) });
        actions.onDelete(user);
        expect(service.list).toHaveBeenCalledOnce();
        expect(toast.info).toHaveBeenCalledExactlyOnceWith('Usuário excluído.');
        expect(dialog.open.mock.calls[0][1].data.content).not.toContain('sua própria conta');
    });

    it('ignores cancelled dialogs', () => {
        for (const dto of [undefined, null]) {
            dialog.open.mockReturnValue({ afterClosed: () => of(dto) });
            actions.onCreate();
        }
        expect(service.create).not.toHaveBeenCalled();
        expect(service.list).not.toHaveBeenCalled();
    });

    it('requires explicit confirmation before deleting', () => {
        dialog.open.mockReturnValue({ afterClosed: () => of(false) });
        actions.onDelete(user);
        expect(service.delete).not.toHaveBeenCalled();
    });

    it('does not reload after a failed update', () => {
        service.update.mockReturnValue(throwError(() => new Error('failed')));
        dialog.open.mockReturnValue({ afterClosed: () => of(user) });
        actions.onEdit(user);
        expect(service.list).not.toHaveBeenCalled();
        expect(toast.info).not.toHaveBeenCalled();
    });
    it('opens details with the selected user without saving or refreshing the list', () => {
        dialog.open.mockReturnValue({ afterClosed: () => of(user) });
        actions.onDetails(user);
        expect(dialog.open.mock.calls[0][1]).toMatchObject({
            data: { mode: 'details', user },
            autoFocus: 'dialog',
        });
        expect(service.create).not.toHaveBeenCalled();
        expect(service.update).not.toHaveBeenCalled();
        expect(service.list).not.toHaveBeenCalled();
    });

    it('does not save or refresh after cancelling the edit dialog', () => {
        actions.onEdit(user);
        expect(service.update).not.toHaveBeenCalled();
        expect(service.list).not.toHaveBeenCalled();
    });
});
