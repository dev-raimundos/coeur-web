import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/services/authentication/auth.service';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { User } from '@shared/models/user.model';
import { DeleteUserDialogData, UserDialogData } from '../../models/user-dialog.model';
import { DeleteUserDialogComponent } from '../delete-user-dialog/delete-user-dialog.component';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { UserActionsService } from '../../services/user-actions.service';
import { UsersPaginatorIntl } from '../../services/users-paginator-intl.service';
import { UsersStateService } from '../../services/users-state.service';
import { UserInitialsPipe } from '../../pipes/user-initials.pipe';

@Component({
    selector: 'app-user-list',
    imports: [MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatMenuModule,
        MatPaginatorModule, MatProgressBarModule, MatSortModule, MatTableModule, UserInitialsPipe],
    providers: [{ provide: MatPaginatorIntl, useClass: UsersPaginatorIntl }],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.scss',
})
export class UserListComponent {
    readonly state = inject(UsersStateService);
    readonly details = inject(UserActionsService);
    private readonly _dialog = inject(MatDialog);
    private readonly _toast = inject(ToastService);
    private readonly _auth = inject(AuthService);
    private readonly _destroyRef = inject(DestroyRef);
    readonly columns = ['name', 'email', 'roles', 'actions'];

    create(): void { this._openDialog({ mode: 'create' }); }

    open(user: User, mode: 'edit' | 'details'): void {
        this.details.loadUser(user.id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
            next: (freshUser) => this._openDialog({ mode, user: freshUser }),
            error: () => {},
        });
    }

    remove(user: User): void {
        const isCurrentUser = user.id === this._auth.currentUser()?.id;
        this._dialog.open<DeleteUserDialogComponent, DeleteUserDialogData, boolean>(DeleteUserDialogComponent, {
            data: { user, isCurrentUser }, width: '440px', maxWidth: 'calc(100vw - 32px)',
        }).afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((deleted) => {
            if (!deleted) return;
            this._toast.info('Usuário excluído.');
            if (isCurrentUser) this._auth.logout();
            else this.state.reload();
        });
    }

    private _openDialog(data: UserDialogData): void {
        this._dialog.open<UserDialogComponent, UserDialogData, User>(UserDialogComponent, {
            data, width: '520px', maxWidth: 'calc(100vw - 32px)',
            autoFocus: data.mode === 'details' ? 'dialog' : 'first-tabbable',
        }).afterClosed().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((saved) => {
            if (!saved) return;
            this._toast.info(data.mode === 'create' ? 'Usuário criado.' : 'Usuário atualizado.');
            if (saved.id === this._auth.currentUser()?.id) {
                this._auth.fetchCurrentUser().pipe(takeUntilDestroyed(this._destroyRef)).subscribe();
            }
            this.state.reload();
        });
    }
}
