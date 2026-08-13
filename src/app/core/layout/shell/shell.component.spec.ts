import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { ShellComponent } from './shell.component';
import { AuthService } from '@core/services/authentication/auth.service';
import { User } from '@shared/models/user.model';

describe('ShellComponent', () => {
    let component: ShellComponent;
    let fixture: ComponentFixture<ShellComponent>;
    let currentUser: ReturnType<typeof signal<User | null>>;
    let logoutSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        currentUser = signal<User | null>(null);
        logoutSpy = vi.fn();

        await TestBed.configureTestingModule({
            imports: [ShellComponent],
            providers: [
                provideRouter([]),
                {
                    provide: AuthService,
                    useValue: { currentUser, logout: logoutSpy },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ShellComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
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

    it("should display the current user's name in the toolbar when logged in", () => {
        currentUser.set({
            id: '1',
            name: 'Ana Silva',
            email: 'ana@example.com',
            role: 'admin',
            isActive: true,
            isEmailVerified: 'true',
            createdAt: '',
            updatedAt: null,
            lastLoginAt: null,
        });
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.user-name')?.textContent).toContain('Ana Silva');
    });
});
