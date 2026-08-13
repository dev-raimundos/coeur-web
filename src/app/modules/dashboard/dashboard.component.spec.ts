import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '@core/services/authentication/auth.service';
import { User } from '@shared/models/user.model';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let currentUser: ReturnType<typeof signal<User | null>>;

    beforeEach(async () => {
        currentUser = signal<User | null>(null);

        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [{ provide: AuthService, useValue: { currentUser } }],
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should greet the current user by name when logged in', () => {
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
        expect(compiled.textContent).toContain('Ana Silva');
    });
});
