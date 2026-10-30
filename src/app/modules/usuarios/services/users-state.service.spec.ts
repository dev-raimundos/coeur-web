import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { UserPage } from '../models/user-management.model';
import { UserService } from './user.service';
import { UsersStateService } from './users-state.service';

describe('UsersStateService', () => {
    const user = { id: '1', name: 'Ana Silva', email: 'ana@example.com', roles: 'ROLE_USER' };
    const api = { list: vi.fn() };
    let state: UsersStateService;

    beforeEach(() => {
        vi.clearAllMocks();
        api.list.mockReturnValue(of({ content: [user], totalElements: 1 }));
        TestBed.configureTestingModule({ providers: [UsersStateService, { provide: UserService, useValue: api }] });
        state = TestBed.inject(UsersStateService);
    });

    it('loads the first page and exposes read-only state', () => {
        expect(api.list).toHaveBeenCalledWith(0, 10, 'name,asc');
        expect(state.users()).toEqual([user]);
        expect(state.total()).toBe(1);
        expect(state.loading()).toBe(false);
        expect('set' in state.users).toBe(false);
    });

    it('requests pagination and resets the page when sorting', () => {
        state.changePage({ pageIndex: 2, pageSize: 20, length: 100 });
        expect(api.list).toHaveBeenLastCalledWith(2, 20, 'name,asc');
        state.changeSort({ active: 'email', direction: 'desc' });
        expect(api.list).toHaveBeenLastCalledWith(0, 20, 'email,desc');
        expect(state.sort()).toEqual({ active: 'email', direction: 'desc' });
    });

    it('recovers after a failed request', () => {
        api.list.mockReturnValueOnce(throwError(() => new Error('offline')));
        state.reload();
        expect(state.failed()).toBe(true);
        expect(state.loading()).toBe(false);
        state.reload();
        expect(state.failed()).toBe(false);
    });

    it('ignores outdated page responses', () => {
        const oldPage = new Subject<UserPage>();
        api.list.mockReturnValueOnce(oldPage);
        state.reload();
        state.changePage({ pageIndex: 1, pageSize: 10, length: 20 });
        oldPage.next({ content: [], totalElements: 0 });
        expect(state.users()).toEqual([user]);
    });

    it('returns to the last available page after deleting its final row', () => {
        state.changePage({ pageIndex: 1, pageSize: 10, length: 11 });
        api.list.mockReturnValueOnce(of({ content: [], totalElements: 10 }));
        state.reload();
        expect(state.pageIndex()).toBe(0);
        expect(api.list).toHaveBeenLastCalledWith(0, 10, 'name,asc');
    });
});
