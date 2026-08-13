import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '@core/services/authentication/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    private readonly _fb = inject(FormBuilder);
    private readonly _authService = inject(AuthService);
    private readonly _router = inject(Router);
    private readonly _route = inject(ActivatedRoute);

    isLoading = this._authService.isLoginLoading;
    hidePassword = signal(true);

    form = this._fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    togglePasswordVisibility(): void {
        this.hidePassword.set(!this.hidePassword());
    }

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this._authService.login(this.form.getRawValue()).subscribe({
            next: () => {
                const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
                this._router.navigateByUrl(returnUrl);
            },
            error: () => {
                // Erro já é exibido globalmente pelo HttpErrorInterceptor via toast.
            },
        });
    }
}
