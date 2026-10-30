import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/services/authentication/auth.service';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { of } from 'rxjs';
import { UserService } from '../../services/user.service';
import { UsersStateService } from '../../services/users-state.service';
import { UsuariosPage } from './usuarios.page';

describe('UsuariosPage', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UsuariosPage],
            providers: [
                { provide: UserService, useValue: {
                    list: () => of({
                        content: [{ id: '1', name: 'Ana Silva', email: 'ana@example.com', roles: 'ROLE_USER' }],
                        totalElements: 1,
                    }),
                } },
                { provide: MatDialog, useValue: { open: vi.fn() } },
                { provide: AuthService, useValue: { currentUser: signal(null) } },
                { provide: ToastService, useValue: { info: vi.fn() } },
            ],
        });
    });

    it('composes the list without making the scroll container focusable', async () => {
        const fixture = TestBed.createComponent(UsuariosPage);
        await fixture.whenStable();
        const host: HTMLElement = fixture.nativeElement;
        expect(host.textContent).toContain('Ana Silva');
        expect(host.querySelector('.table-scroll')?.hasAttribute('tabindex')).toBe(false);
        expect(host.querySelector('table')?.getAttribute('aria-label')).toBe('Usuários cadastrados');
        expect(host.querySelector('th')?.getAttribute('scope')).toBe('col');
    });

    it('keeps each page instance state isolated', async () => {
        const first = TestBed.createComponent(UsuariosPage);
        const second = TestBed.createComponent(UsuariosPage);
        await Promise.all([first.whenStable(), second.whenStable()]);
        const firstState = first.debugElement.injector.get(UsersStateService);
        const secondState = second.debugElement.injector.get(UsersStateService);
        firstState.changePage({ pageIndex: 2, pageSize: 20, length: 100 });
        expect(firstState.pageIndex()).toBe(2);
        expect(secondState.pageIndex()).toBe(0);
    });
});
