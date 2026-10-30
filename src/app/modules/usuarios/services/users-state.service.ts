import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { User } from '@shared/models/user.model';
import { catchError, defer, finalize, of, startWith, Subject, switchMap } from 'rxjs';
import { UserService } from './user.service';

@Injectable()
export class UsersStateService {
    private readonly _api = inject(UserService);
    private readonly _destroyRef = inject(DestroyRef);
    private readonly _reload = new Subject<void>();
    private readonly _users = signal<User[]>([]);
    private readonly _total = signal(0);
    private readonly _loading = signal(true);
    private readonly _failed = signal(false);
    private readonly _pageIndex = signal(0);
    private readonly _pageSize = signal(10);
    private readonly _sort = signal<Sort>({ active: 'name', direction: 'asc' });

    readonly users = this._users.asReadonly();
    readonly total = this._total.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly failed = this._failed.asReadonly();
    readonly pageIndex = this._pageIndex.asReadonly();
    readonly pageSize = this._pageSize.asReadonly();
    readonly sort = this._sort.asReadonly();
    private readonly _sortParameter = computed(() => `${this._sort().active},${this._sort().direction}`);

    constructor() {
        this._reload.pipe(
            startWith(undefined),
            switchMap(() => defer(() => {
                this._loading.set(true);
                this._failed.set(false);
                return this._api.list(this._pageIndex(), this._pageSize(), this._sortParameter()).pipe(
                    catchError(() => { this._failed.set(true); return of(null); }),
                    finalize(() => this._loading.set(false)),
                );
            })),
            takeUntilDestroyed(this._destroyRef),
        ).subscribe((page) => {
            if (!page) return;
            this._total.set(page.totalElements);
            if (!page.content.length && page.totalElements > 0 && this._pageIndex() > 0) {
                this._pageIndex.set(Math.ceil(page.totalElements / this._pageSize()) - 1);
                this.reload();
                return;
            }
            this._users.set(page.content);
        });
    }

    reload(): void { this._reload.next(); }

    changePage(event: PageEvent): void {
        this._pageIndex.set(event.pageIndex);
        this._pageSize.set(event.pageSize);
        this.reload();
    }

    changeSort(sort: Sort): void {
        this._sort.set(sort.direction ? sort : { active: 'name', direction: 'asc' });
        this._pageIndex.set(0);
        this.reload();
    }
}
