import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/services/authentication/auth.service';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { UserListComponent } from '../../components/user-list/user-list.component';
import { UsuariosPage } from './usuarios.page';

describe('UsuariosPage', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [UsuariosPage],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: MatDialog, useValue: { open: vi.fn() } },
                { provide: AuthService, useValue: { currentUser: signal(null) } },
                { provide: ToastService, useValue: { info: vi.fn() } },
            ],
        });
    });

    it('composes the list without making the scroll container focusable', async () => {
        const fixture = TestBed.createComponent(UsuariosPage);
        fixture.detectChanges();
        TestBed.inject(HttpTestingController)
            .expectOne((req) => req.url === '/api/v1/users')
            .flush({
                content: [
                    { id: '1', name: 'Ana Silva', email: 'ana@example.com', roles: 'ROLE_USER' },
                ],
                totalElements: 1,
            });
        await fixture.whenStable();
        const host: HTMLElement = fixture.nativeElement;
        expect(host.textContent).toContain('Ana Silva');
        expect(host.querySelector('.table-scroll')?.hasAttribute('tabindex')).toBe(false);
        expect(host.querySelector('table')?.getAttribute('aria-label')).toBe(
            'Usuários cadastrados',
        );
        expect(host.querySelector('th')?.getAttribute('scope')).toBe('col');
    });

    it('keeps each page instance state isolated', async () => {
        const first = TestBed.createComponent(UsuariosPage);
        const second = TestBed.createComponent(UsuariosPage);
        first.detectChanges();
        second.detectChanges();
        const http = TestBed.inject(HttpTestingController);
        for (const request of http.match((req) => req.url === '/api/v1/users')) {
            request.flush({ content: [], totalElements: 0 });
        }
        await Promise.all([first.whenStable(), second.whenStable()]);
        const firstState = first.debugElement.query(By.directive(UserListComponent))
            .componentInstance as UserListComponent;
        const secondState = second.debugElement.query(By.directive(UserListComponent))
            .componentInstance as UserListComponent;
        firstState.changePage({ pageIndex: 2, pageSize: 20, length: 100 });
        expect(firstState.pageIndex()).toBe(2);
        http.expectOne((req) => req.url === '/api/v1/users').flush({
            content: [],
            totalElements: 0,
        });
        expect(secondState.pageIndex()).toBe(0);
    });
});
