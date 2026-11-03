import { Component, computed, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, filter, Subscription, switchMap } from 'rxjs';
import { UserFormService } from '../../services/user-form.service';
import { DeleteUserService } from '../../services/delete-user.service';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/services/authentication/auth.service';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { User } from '@shared/models/user.model';
import { UserDialogData, UserDialogResult } from '../../models/user-dialog.model';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData,
} from '@shared/components/confirmation-dialog/confirmation-dialog.component';
import { UserDialogComponent } from './user-dialog/user-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { UserActionsService } from '../../services/user-actions.service';
import { UserService } from '../../services/user.service';
import { isValidDto } from '@shared/utils/type-guard';
import { UserInitialsPipe } from '@shared/pipes/user-initials.pipe';

@Component({
    selector: 'app-user-list',
    imports: [
        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatSortModule,
        MatTableModule,
        UserInitialsPipe,
    ],
    providers: [UserFormService, DeleteUserService],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
    public readonly api = inject(UserService);
    public readonly details = inject(UserActionsService);
    public readonly mutation = inject(UserFormService);
    public readonly deletion = inject(DeleteUserService);
    public readonly busy = computed(() => this.mutation.saving() || this.deletion.deleting());
    private readonly _dialog = inject(MatDialog);
    private readonly _toast = inject(ToastService);
    private readonly _auth = inject(AuthService);
    private readonly _destroyRef = inject(DestroyRef);
    public readonly columns = ['name', 'email', 'roles', 'actions'];

    private _listRequest?: Subscription;

    public refresh(): void {
        this._load(this.api.page(), this.api.perPage(), this.api.sort());
    }

    public handlePageEvent(event: PageEvent): void {
        this._load(event.pageIndex, event.pageSize, this.api.sort());
    }

    public changeSort(sort: Sort): void {
        const value = sort.direction ? sort.active + ',' + sort.direction : 'name,asc';
        this._load(0, this.api.perPage(), value);
    }

    private _load(page: number, perPage: number, sort: string): void {
        this._listRequest?.unsubscribe();
        this._listRequest = this.api
            .list(page, perPage, sort)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({ error: () => {} });
    }

    public ngOnInit(): void {
        this.refresh();
    }

    public create(): void {
        if (!this.busy()) this._openDialog({ mode: 'create' });
    }

    public open(user: User, mode: 'edit' | 'details'): void {
        if (this.busy()) return;
        this.details
            .loadUser(user.id)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
                next: (freshUser) => this._openDialog({ mode, user: freshUser }),
                error: () => {},
            });
    }

    public remove(user: User): void {

        if (this.busy()) {
            return;
        }
        const isCurrentUser = user.id === this._auth.currentUser()?.id;
        this._dialog
            .open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(
                ConfirmationDialogComponent,
                {
                    data: {
                        title: 'Excluir usuário?',
                        content: `A conta de ${user.name} (${user.email}) será excluída permanentemente.\n\nEsta ação não pode ser desfeita.${isCurrentUser ? '\n\nVocê está excluindo sua própria conta e sairá da aplicação.' : ''}`,
                        confirmLabel: 'Excluir usuário',
                    },
                    width: '440px',
                    maxWidth: 'calc(100vw - 32px)',
                },
            )
            .afterClosed()
            .pipe(
                filter(isValidDto<boolean>),
                switchMap(() => this.deletion.delete(user.id)),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe({
                next: () => {
                    this._toast.info('Usuário excluído.');
                    if (isCurrentUser) this._auth.logout();
                    else this.refresh();
                },
                error: () => {},
            });
    }

    private _openDialog(data: UserDialogData): void {
        this._dialog
            .open<UserDialogComponent, UserDialogData, UserDialogResult>(UserDialogComponent, {
                data,
                width: '520px',
                maxWidth: 'calc(100vw - 32px)',
                autoFocus: data.mode === 'details' ? 'dialog' : 'first-tabbable',
            })
            .afterClosed()
            .pipe(
                filter(isValidDto<UserDialogResult>),
                switchMap((dto) => {
                    const { name, email, password, roles } = dto;
                    if (data.mode === 'create')
                        return this.mutation.create({ name, email, password });
                    if (data.mode === 'edit')
                        return this.mutation.update(data.user.id, { name, email, roles });
                    return EMPTY;
                }),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe({
                next: (saved) => {
                    this._toast.info(
                        data.mode === 'create' ? 'Usuário criado.' : 'Usuário atualizado.',
                    );
                    if (saved.id === this._auth.currentUser()?.id) {
                        this._auth
                            .fetchCurrentUser()
                            .pipe(takeUntilDestroyed(this._destroyRef))
                            .subscribe();
                    }
                    this.refresh();
                },
                error: () => {},
            });
    }
}
