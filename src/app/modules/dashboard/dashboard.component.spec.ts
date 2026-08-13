import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { DashboardComponent } from './dashboard.component';
import { AuthService } from '@core/services/authentication/auth.service';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { User } from '@shared/models/user.model';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let currentUser: ReturnType<typeof signal<User | null>>;
    let toastInfoSpy: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        currentUser = signal<User | null>(null);
        toastInfoSpy = vi.fn();

        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [
                { provide: AuthService, useValue: { currentUser } },
                { provide: ToastService, useValue: { info: toastInfoSpy } },
            ],
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

    it('should not submit and should mark all fields as touched when the demo form is invalid', () => {
        component.submitForm();

        expect(toastInfoSpy).not.toHaveBeenCalled();
        expect(component.form.touched).toBe(true);
    });

    it('should notify and reset the demo form on a valid submit', () => {
        component.form.setValue({
            name: 'Carla Souza',
            email: 'carla@example.com',
            category: 'Urgente',
            date: null,
            tags: ['Backend'],
            plan: 'Enterprise',
            agree: true,
            notifications: false,
            volume: 80,
        });

        component.submitForm();

        expect(toastInfoSpy).toHaveBeenCalledWith('Formulário enviado para Carla Souza.');
        expect(component.form.getRawValue().name).toBe('');
        expect(component.form.getRawValue().plan).toBe('Pro');
    });

    it('should toggle isLoading and notify once the simulated loading finishes', () => {
        vi.useFakeTimers();

        component.simulateLoading();
        expect(component.isLoading()).toBe(true);
        expect(toastInfoSpy).not.toHaveBeenCalled();

        vi.runAllTimers();

        expect(component.isLoading()).toBe(false);
        expect(toastInfoSpy).toHaveBeenCalledWith('Operação concluída com sucesso!');

        vi.useRealTimers();
    });

    it('should open the confirmation dialog', () => {
        fixture.detectChanges();

        component.openDialog();

        const compiled = document.body;
        expect(compiled.textContent).toContain('Confirmar ação');
    });
});
