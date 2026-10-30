import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserFormService } from '../../services/user-form.service';
import { UserDialogData } from '../../models/user-dialog.model';
import { User } from '@shared/models/user.model';
import { finalize } from 'rxjs';

const DIALOG_TITLES = { create: 'Novo usuário', edit: 'Editar usuário', details: 'Detalhes do usuário' };

@Component({
    selector: 'app-user-dialog',
    imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
        MatButtonModule, MatIconModule, MatProgressBarModule],
    providers: [UserFormService],
    templateUrl: './user-dialog.component.html',
    styleUrl: './user-dialog.component.scss',
})
export class UserDialogComponent {
    readonly state = inject(UserFormService);
    private readonly _data = inject<UserDialogData>(MAT_DIALOG_DATA);
    private readonly _ref = inject<MatDialogRef<UserDialogComponent, User>>(MatDialogRef);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _fb = inject(FormBuilder);
    readonly hidePassword = signal(true);
    readonly isCreate = this._data.mode === 'create';
    readonly isDetails = this._data.mode === 'details';
    readonly user = this._data.mode === 'create' ? undefined : this._data.user;
    readonly title = DIALOG_TITLES[this._data.mode];
    readonly submitLabel = this.isCreate ? 'Criar usuário' : 'Salvar alterações';
    readonly form = this._fb.nonNullable.group({
        name: [this.user?.name ?? '', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
        email: [this.user?.email ?? '', [Validators.required, Validators.email, Validators.maxLength(100)]],
        password: ['', this.isCreate ? [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)] : []],
        roles: [this.user?.roles ?? 'ROLE_USER', [Validators.required, Validators.pattern(/\S/)]],
    });

    togglePasswordVisibility(): void { this.hidePassword.update((hidden) => !hidden); }

    submit(): void {
        if (this.state.saving() || this.isDetails) return;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const value = this.form.getRawValue();
        const name = value.name.trim();
        const email = value.email.trim();
        const request = this._data.mode === 'create'
            ? this.state.create({ name, email, password: value.password })
            : this.state.update(this._data.user.id, { name, email, roles: value.roles.trim() });
        this._ref.disableClose = true;
        request.pipe(
            takeUntilDestroyed(this._destroyRef),
            finalize(() => { this._ref.disableClose = false; }),
        ).subscribe({
            next: (user) => this._ref.close(user),
            error: () => {
                if (this.state.emailConflict()) this.form.controls.email.setErrors({ conflict: true });
            },
        });
    }
}
