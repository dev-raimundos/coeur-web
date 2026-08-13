import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';

import { LoginComponent } from './login.component';
import { AuthService } from '@core/services/authentication/auth.service';
import { User } from '@shared/models/user.model';

const USER: User = {
    id: '1',
    name: 'Ana Silva',
    email: 'ana@example.com',
    role: 'admin',
    isActive: true,
    isEmailVerified: 'true',
    createdAt: '',
    updatedAt: null,
    lastLoginAt: null,
};

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let loginSpy: ReturnType<typeof vi.fn>;
    let router: Router;

    function setup(returnUrl: string | null = null) {
        loginSpy = vi.fn().mockReturnValue(of(USER));

        TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                {
                    provide: AuthService,
                    useValue: { isLoginLoading: signal(false), login: loginSpy },
                },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}) } },
                },
            ],
        });

        router = TestBed.inject(Router);
        vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
    }

    it('should create', () => {
        setup();
        expect(component).toBeTruthy();
    });

    it('should not call AuthService.login when the form is invalid', () => {
        setup();
        component.submit();
        expect(loginSpy).not.toHaveBeenCalled();
        expect(component.form.touched).toBe(true);
    });

    it('should call AuthService.login and navigate to /dashboard by default', () => {
        setup();
        component.form.setValue({ email: 'ana@example.com', password: 'secret123' });

        component.submit();

        expect(loginSpy).toHaveBeenCalledWith({ email: 'ana@example.com', password: 'secret123' });
        expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate to the returnUrl query param when present', () => {
        setup('/usuarios');
        component.form.setValue({ email: 'ana@example.com', password: 'secret123' });

        component.submit();

        expect(router.navigateByUrl).toHaveBeenCalledWith('/usuarios');
    });

    it('should not navigate when login fails', () => {
        setup();
        loginSpy.mockReturnValue(throwError(() => new Error('invalid credentials')));
        component.form.setValue({ email: 'ana@example.com', password: 'wrong' });

        component.submit();

        expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('should toggle password field visibility', () => {
        setup();
        expect(component.hidePassword()).toBe(true);
        component.togglePasswordVisibility();
        expect(component.hidePassword()).toBe(false);
    });
});
