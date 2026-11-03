import { Component, inject, OnInit } from '@angular/core';
import { catchError, EMPTY, filter, Subscription, switchMap, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from '@core/services/notification/toast/toast.service';
import { User } from '@shared/models/user.model';
import { RegisterUserDTO } from '../../models/register-user.dto';
import { UpdateUserDTO } from '../../models/update-user.dto';
import { ConfirmationDialogComponent } from '@shared/components/confirmation-dialog/confirmation-dialog.component';
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
import { UserService } from '../../services/user.service';
import { isValidDto } from '@shared/utils/type-guard';
import { UserInitialsPipe } from '@shared/pipes/user-initials.pipe';
import { UserRoleLabelPipe } from '@shared/pipes/user-role-label.pipe';

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
        UserRoleLabelPipe,
        UserRoleLabelPipe,
    ],
    templateUrl: './user-list.component.html',
    styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
    public readonly service = inject(UserService);
    private readonly _dialog = inject(MatDialog);
    private readonly _toast = inject(ToastService);
    public readonly columns = ['name', 'email', 'roles', 'actions'];

    private _listRequest?: Subscription;

    public refresh(): void {
        this._load(this.service.page(), this.service.perPage(), this.service.sort());
    }

    public handlePageEvent(event: PageEvent): void {
        this._load(event.pageIndex, event.pageSize, this.service.sort());
    }

    public changeSort(sort: Sort): void {
        const value = sort.direction ? sort.active + ',' + sort.direction : 'name,asc';
        this._load(0, this.service.perPage(), value);
    }

    private _load(page: number, perPage: number, sort: string): void {
        if (this._listRequest) {
            this._listRequest.unsubscribe();
        }
        this._listRequest = this.service.list(page, perPage, sort).subscribe({ error: () => {} });
    }

    public ngOnInit(): void {
        this.refresh();
    }

    public onCreate(): void {
        this._dialog
            .open(UserDialogComponent, {
                data: { mode: 'create' },
                width: '520px',
                maxWidth: 'calc(100vw - 32px)',
                autoFocus: 'first-tabbable',
            })
            .afterClosed()
            .pipe(
                filter(isValidDto<RegisterUserDTO>),
                switchMap((dto) => this.service.create(dto)),
                tap(() => this._toast.info('Usuário criado.')),
                catchError(() => EMPTY),
            )
            .subscribe(() => this.refresh());
    }

    public onEdit(user: User): void {
        this._dialog
            .open(UserDialogComponent, {
                data: { mode: 'edit', user },
                width: '520px',
                maxWidth: 'calc(100vw - 32px)',
                autoFocus: 'first-tabbable',
            })
            .afterClosed()
            .pipe(
                filter(isValidDto<UpdateUserDTO>),
                switchMap((dto) => this.service.update(user.id, dto)),
                tap(() => this._toast.info('Usuário atualizado.')),
                catchError(() => EMPTY),
            )
            .subscribe(() => this.refresh());
    }

    public onDetails(user: User): void {
        this._dialog.open(UserDialogComponent, {
            data: { mode: 'details', user },
            width: '520px',
            maxWidth: 'calc(100vw - 32px)',
            autoFocus: 'dialog',
        });
    }

    public onDelete(user: User): void {
        this._dialog
            .open(ConfirmationDialogComponent, {
                data: {
                    title: 'Excluir usuário?',
                    content: `A conta de ${user.name} (${user.email}) será excluída permanentemente.\n\nEsta ação não pode ser desfeita.`,
                    confirmLabel: 'Excluir usuário',
                },
                width: '440px',
                maxWidth: 'calc(100vw - 32px)',
            })
            .afterClosed()
            .pipe(
                filter(isValidDto<boolean>),
                switchMap(() => this.service.delete(user.id)),
                tap(() => this._toast.info('Usuário excluído.')),
                catchError(() => EMPTY),
            )
            .subscribe(() => this.refresh());
    }
}
