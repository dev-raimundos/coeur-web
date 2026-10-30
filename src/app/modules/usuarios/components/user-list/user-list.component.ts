import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subscription, switchMap } from 'rxjs';
import { UserFormService } from '../../services/user-form.service';
import { DeleteUserService } from '../../services/delete-user.service';
import { DeleteUserRequest, UserPage } from '../../models/user-management.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@core/services/authentication/auth.service';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { User } from '@shared/models/user.model';
import {
    DeleteUserDialogData,
    UserDialogData,
    UserDialogResult,
} from '../../models/user-dialog.model';
import { DeleteUserDialogComponent } from '../delete-user-dialog/delete-user-dialog.component';
import { UserDialogComponent } from '../user-dialog/user-dialog.component';
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
    readonly api = inject(UserService);
    readonly details = inject(UserActionsService);
    readonly mutation = inject(UserFormService);
    readonly deletion = inject(DeleteUserService);
    readonly busy = computed(() => this.mutation.saving() || this.deletion.deleting());
    private readonly _dialog = inject(MatDialog);
    private readonly _toast = inject(ToastService);
    private readonly _auth = inject(AuthService);
    private readonly _destroyRef = inject(DestroyRef);
    readonly columns = ['name', 'email', 'roles', 'actions'];

    readonly page = signal<UserPage>({ content: [], totalElements: 0 });
    readonly pageIndex = signal(0);
    readonly pageSize = signal(10);
    readonly sort = signal<Sort>({ active: 'name', direction: 'asc' });
    private _listRequest?: Subscription;

    reload(): void {
        this._listRequest?.unsubscribe();
        const { active, direction } = this.sort();
        this._listRequest = this.api
            .list(this.pageIndex(), this.pageSize(), `${active},${direction}`)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
                next: (page) => {
                    this.page.set(page);
                    const lastPage = Math.max(
                        0,
                        Math.ceil(page.totalElements / this.pageSize()) - 1,
                    );
                    if (this.pageIndex() > lastPage) {
                        this.pageIndex.set(lastPage);
                        this.reload();
                    }
                },
                error: () => {},
            });
    }

    changePage(event: PageEvent): void {
        this.pageIndex.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
        this.reload();
    }

    changeSort(sort: Sort): void {
        this.sort.set(sort.direction ? sort : { active: 'name', direction: 'asc' });
        this.pageIndex.set(0);
        this.reload();
    }

    ngOnInit(): void {
        this.reload();
    }

    create(): void {
        if (!this.busy()) this._openDialog({ mode: 'create' });
    }

    open(user: User, mode: 'edit' | 'details'): void {
        if (this.busy()) return;
        this.details
            .loadUser(user.id)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
                next: (freshUser) => this._openDialog({ mode, user: freshUser }),
                error: () => {},
            });
    }

    remove(user: User): void {
        if (this.busy()) return;
        const isCurrentUser = user.id === this._auth.currentUser()?.id;
        this._dialog
            .open<DeleteUserDialogComponent, DeleteUserDialogData, DeleteUserRequest>(
                DeleteUserDialogComponent,
                {
                    data: { user, isCurrentUser },
                    width: '440px',
                    maxWidth: 'calc(100vw - 32px)',
                },
            )
            .afterClosed()
            .pipe(
                switchMap((dto) => (dto?.id === user.id ? this.deletion.delete(user.id) : EMPTY)),
                takeUntilDestroyed(this._destroyRef),
            )
            .subscribe({
                next: () => {
                    this._toast.info('Usuário excluído.');
                    if (isCurrentUser) this._auth.logout();
                    else this.reload();
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
                switchMap((dto) => {
                    if (!dto) return EMPTY;
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
                    this.reload();
                },
                error: () => {},
            });
    }
}
