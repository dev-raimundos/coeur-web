import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntlService } from '@shared/services/paginator-intl.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { ShellComponent } from './shell.component';
import { AuthService } from '@core/services/authentication/auth.service';
import { Theme, ThemeService } from '@core/services/theme/theme.service';
import { User } from '@shared/models/user.model';

describe('ShellComponent', () => {
    let component: ShellComponent;
    let fixture: ComponentFixture<ShellComponent>;
    let currentUser: ReturnType<typeof signal<User | null>>;
    let theme: ReturnType<typeof signal<Theme>>;
    let logoutSpy: ReturnType<typeof vi.fn>;
    let setThemeSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        currentUser = signal<User | null>(null);
        theme = signal<Theme>('light');
        logoutSpy = vi.fn();
        setThemeSpy = vi.fn();

        await TestBed.configureTestingModule({
            imports: [ShellComponent],
            providers: [
                provideRouter([]),
                {
                    provide: AuthService,
                    useValue: { currentUser, logout: logoutSpy },
                },
                {
                    provide: ThemeService,
                    useValue: { theme, setTheme: setThemeSpy },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ShellComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('provides the shared translation to all paginators inside the authenticated layout', () => {
        const intl = fixture.debugElement.injector.get(MatPaginatorIntl);
        expect(intl).toBeInstanceOf(PaginatorIntlService);
        expect(intl.itemsPerPageLabel).toBe('Itens por página:');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should toggle the sidenav opened state', () => {
        const initial = component.opened();
        component.toggleSidenav();
        expect(component.opened()).toBe(!initial);
    });

    it('should delegate logout to AuthService', () => {
        component.logout();
        expect(logoutSpy).toHaveBeenCalled();
    });

    it('should delegate theme changes to ThemeService', () => {
        component.setTheme('dark');
        expect(setThemeSpy).toHaveBeenCalledWith('dark');
    });

    it("should display the current user's initials and name in the sidenav user menu when logged in", () => {
        currentUser.set({
            id: '1',
            name: 'Ana Silva',
            email: 'ana@example.com',
            roles: 'admin',
        });
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.user-avatar')?.textContent).toContain('AS');
        expect(compiled.querySelector('.user-name')?.textContent).toContain('Ana Silva');
    });

    it('should use a single initial when the user has only one name', () => {
        currentUser.set({
            id: '1',
            name: 'Madonna',
            email: 'madonna@example.com',
            roles: 'admin',
        });
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.user-avatar')?.textContent).toContain('M');
        expect(compiled.querySelector('.user-name')?.textContent).toContain('Madonna');
    });

    it('should use the first and second names for initials when there are more names', () => {
        currentUser.set({
            id: '1',
            name: '  Ana   Silva Costa  ',
            email: 'ana@example.com',
            roles: 'ROLE_USER',
        });
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.user-avatar')?.textContent?.trim()).toBe('AS');
    });

    it('should not display the user menu when there is no logged in user', () => {
        currentUser.set(null);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.user-menu-trigger')).toBeNull();
    });
});
