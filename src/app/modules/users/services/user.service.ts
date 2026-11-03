import { EMPTY, finalize, Observable, of, switchMap, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from '@shared/models/user.model';
import { UserPage } from '../models/user-management.model';
import { RegisterUserDTO } from '../models/register-user.dto';
import { UpdateUserDTO } from '../models/update-user.dto';

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly _http = inject(HttpClient);
    private readonly _url = '/api/v1/users';

    private readonly _loading = signal(false);
    private readonly _detailsLoading = signal(false);
    private readonly _data = signal<UserPage>({ content: [], totalElements: 0 });
    private readonly _page = signal(0);
    private readonly _perPage = signal(10);
    private readonly _sort = signal('name,asc');

    public readonly loading = this._loading.asReadonly();
    public readonly detailsLoading = this._detailsLoading.asReadonly();
    public readonly data = this._data.asReadonly();
    public readonly page = this._page.asReadonly();
    public readonly perPage = this._perPage.asReadonly();
    public readonly sort = this._sort.asReadonly();

    public list(page: number, size: number, sort: string): Observable<UserPage> {
        const params = new HttpParams().set('page', page).set('size', size).set('sort', sort);

        this._page.set(page);
        this._perPage.set(size);
        this._sort.set(sort);
        this._loading.set(true);

        return this._http.get<UserPage>(this._url, { params }).pipe(
            switchMap((response) => {
                const lastPage = Math.max(0, Math.ceil(response.totalElements / size) - 1);
                return page > lastPage ? this.list(lastPage, size, sort) : of(response);
            }),
            tap((response) => this._data.set(response)),
            finalize(() => this._loading.set(false)),
        );
    }

    public get(id: string): Observable<User> {
        if (this._detailsLoading()) {
            return EMPTY;
        }

        this._detailsLoading.set(true);

        return this._http
            .get<User>(`${this._url}/${encodeURIComponent(id)}`)
            .pipe(finalize(() => this._detailsLoading.set(false)));
    }

    public create(dto: RegisterUserDTO) {
        return this._http.post<User>(`${this._url}/register`, dto);
    }

    public update(id: string, dto: UpdateUserDTO) {
        return this._http.put<User>(`${this._url}/${encodeURIComponent(id)}`, dto);
    }

    public delete(id: string) {
        return this._http.delete<void>(`${this._url}/${encodeURIComponent(id)}`);
    }
}
