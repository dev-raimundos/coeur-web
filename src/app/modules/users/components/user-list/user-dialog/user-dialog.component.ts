import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserRoleLabelPipe } from '@shared/pipes/user-role-label.pipe';
import { USER_ROLE_OPTIONS } from '@shared/models/user-role.model';
import { UserDialogData, UserDialogResult } from '../../../models/user-dialog.model';
import { RegisterUserDTO } from '../../../models/register-user.dto';
import { UpdateUserDTO } from '../../../models/update-user.dto';

const DIALOG_TITLES = {
    create: 'Novo usuário',
    edit: 'Editar usuário',
    details: 'Detalhes do usuário',
};

@Component({
    selector: 'app-user-dialog',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        UserRoleLabelPipe,
    ],
    templateUrl: './user-dialog.component.html',
    styleUrl: './user-dialog.component.scss',
})
export class UserDialogComponent {
    private readonly _data = inject<UserDialogData>(MAT_DIALOG_DATA);
    private readonly _fb = inject(FormBuilder);
    public readonly hidePassword = signal(true);
    public readonly roleOptions = USER_ROLE_OPTIONS;
    public readonly isCreate = this._data.mode === 'create';
    public readonly isDetails = this._data.mode === 'details';
    public readonly user = this._data.mode === 'create' ? undefined : this._data.user;
    public readonly hasCustomRole =
        !!this.user && !USER_ROLE_OPTIONS.some((option) => option.value === this.user?.roles);
    public readonly title = DIALOG_TITLES[this._data.mode];
    public readonly submitLabel = this.isCreate ? 'Criar usuário' : 'Salvar alterações';
    public readonly form = this._fb.nonNullable.group({
        name: [
            this.user?.name ?? '',
            [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)],
        ],
        email: [
            this.user?.email ?? '',
            [Validators.required, Validators.email, Validators.maxLength(100)],
        ],
        password: [
            '',
            this.isCreate
                ? [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]
                : [],
        ],
        roles: [this.user?.roles ?? 'ROLE_USER', [Validators.required, Validators.pattern(/\S/)]],
    });

    public togglePasswordVisibility(): void {
        this.hidePassword.update((hidden) => !hidden);
    }

    public result(): UserDialogResult | undefined {
        if (this.form.invalid || this.isDetails) return undefined;
        const { name, email, password, roles } = this.form.getRawValue();
        const dto: UserDialogResult = this.isCreate
            ? new RegisterUserDTO(name.trim(), email.trim(), password)
            : new UpdateUserDTO(name.trim(), email.trim(), roles.trim());
        return dto;
    }
}
